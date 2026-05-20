import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDocumentProxy, extractText as unpdfExtractText } from "unpdf";

interface ATSAnalysis {
  score: number;
  checks: {
    hasContactInfo: boolean;
    hasSimpleFormatting: boolean;
    hasKeywords: boolean;
    hasStandardSections: boolean;
    hasNoTables: boolean;
    hasNoImages: boolean;
    hasReadableFont: boolean;
  };
  suggestions: string[];
  detectedSections: string[];
  keywords: string[];
}

// Palabras clave comunes en CVs profesionales
const commonKeywords = [
  "javascript", "typescript", "python", "react", "node", "sql", "java",
  "experience", "experiencia", "education", "educación", "skills", "habilidades",
  "project", "proyecto", "management", "gestión", "development", "desarrollo",
  "design", "diseño", "analysis", "análisis", "communication", "comunicación",
  "leadership", "liderazgo", "team", "equipo", "agile", "scrum"
];

// Secciones estándar en CVs
const standardSections = [
  "experience", "experiencia", "work", "trabajo", "employment", "empleo",
  "education", "educación", "formación", "academic",
  "skills", "habilidades", "competencias", "technologies", "tecnologías",
  "projects", "proyectos", "certifications", "certificaciones",
  "languages", "idiomas", "volunteer", "voluntariado"
];

async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === "application/pdf") {
    try {
      // Parsear el PDF usando unpdf (pure JS, compatible con Turbopack)
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const { text } = await unpdfExtractText(pdf, { mergePages: true });
      return text;
    } catch (error: any) {
      console.error("Error parsing PDF:", error.stack || error);

      // Si falla pdf-parse, analizar el buffer como texto plano
      // Esto permite hacer un análisis básico aunque no sea perfecto
      try {
        const textContent = buffer.toString('utf-8', 0, Math.min(50000, buffer.length));

        // Filtrar caracteres no imprimibles pero mantener texto
        const cleanText = textContent
          .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (cleanText.length > 100) {
          console.log("Usando análisis de texto plano como fallback");
          return cleanText;
        }
      } catch (fallbackError) {
        console.error("Error en fallback:", fallbackError);
      }

      throw new Error("No se pudo extraer texto del PDF. Asegúrate de que contiene texto seleccionable (no es una imagen escaneada).");
    }
  }

  // Para DOCX, necesitaríamos una librería adicional como mammoth
  // Por ahora, lanzamos un error informativo
  throw new Error("El análisis de archivos DOCX estará disponible próximamente. Por favor, usa PDF.");
}

function analyzeATSCompatibility(text: string): ATSAnalysis {
  const lowerText = text.toLowerCase();

  // Verificar información de contacto
  const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text);
  const hasPhone = /(\+?[\d\s\-()]{9,})|(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/g.test(text);
  const hasContactInfo = hasEmail && hasPhone;

  // Detectar secciones
  const detectedSections: string[] = [];
  for (const section of standardSections) {
    if (lowerText.includes(section)) {
      if (!detectedSections.includes(section.charAt(0).toUpperCase() + section.slice(1))) {
        detectedSections.push(section.charAt(0).toUpperCase() + section.slice(1));
      }
    }
  }
  const hasStandardSections = detectedSections.length >= 3;

  // Detectar palabras clave
  const keywords: string[] = [];
  for (const keyword of commonKeywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      keywords.push(keyword);
    }
  }
  const hasKeywords = keywords.length >= 5;

  // Verificar formato simple (heurísticas básicas)
  const hasNoTables = !text.includes("|") && !text.match(/\t.*\t.*\t/);
  const hasNoImages = true; // PDF parse ya elimina imágenes, solo texto

  // Verificar caracteres especiales excesivos que pueden confundir ATS
  // Usamos clases de caracteres Unicode (\p{L} para letras, \p{N} para números)
  // para evitar penalizar caracteres del español como acentos y la eñe.
  const specialCharsRatio = (text.match(/[^\p{L}\p{N}\s.,;:()\-]/gu) || []).length / text.length;
  const hasSimpleFormatting = specialCharsRatio < 0.05;

  // Verificar longitud razonable
  const wordCount = text.split(/\s+/).length;
  const hasReadableFont = wordCount > 100 && wordCount < 3000;

  // Calcular checks
  const checks = {
    hasContactInfo,
    hasSimpleFormatting,
    hasKeywords,
    hasStandardSections,
    hasNoTables,
    hasNoImages,
    hasReadableFont
  };

  // Calcular puntuación
  const passedChecks = Object.values(checks).filter(Boolean).length;
  const score = Math.round((passedChecks / 7) * 100);

  // Generar sugerencias
  const suggestions: string[] = [];

  if (!hasContactInfo) {
    if (!hasEmail) {
      suggestions.push("Añade tu dirección de email en una sección visible, preferiblemente en el encabezado.");
    }
    if (!hasPhone) {
      suggestions.push("Incluye tu número de teléfono para facilitar el contacto.");
    }
  }

  if (!hasStandardSections) {
    suggestions.push("Estructura tu CV con secciones claramente etiquetadas: Experiencia, Educación, Habilidades.");
  }

  if (!hasKeywords) {
    suggestions.push("Incluye más palabras clave relevantes relacionadas con tu sector y las habilidades del puesto al que aplicas.");
  }

  if (!hasSimpleFormatting) {
    suggestions.push("Evita caracteres especiales excesivos, símbolos decorativos o fuentes no estándar.");
  }

  if (!hasNoTables) {
    suggestions.push("Evita usar tablas complejas. Usa listas con viñetas en su lugar.");
  }

  if (!hasReadableFont) {
    if (wordCount < 100) {
      suggestions.push("Tu CV parece muy corto. Añade más detalles sobre tu experiencia y logros.");
    } else {
      suggestions.push("Tu CV parece muy extenso. Intenta resumir y enfocarte en lo más relevante (máximo 2 páginas).");
    }
  }

  if (suggestions.length === 0) {
    suggestions.push("¡Excelente! Tu CV tiene buena compatibilidad ATS. Recuerda siempre adaptarlo a cada oferta específica.");
  }

  return {
    score,
    checks,
    suggestions,
    detectedSections,
    keywords
  };
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado. Debes iniciar sesión para usar esta función." },
        { status: 401 }
      );
    }

    // Obtener el archivo del formData
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido. Solo PDF o DOCX." },
        { status: 400 }
      );
    }

    // Validar tamaño
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "El archivo no debe superar los 5MB" },
        { status: 400 }
      );
    }

    // Extraer texto del archivo
    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractText(buffer, file.type);

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: "No se pudo extraer texto suficiente del archivo. Verifica que el PDF contenga texto seleccionable." },
        { status: 400 }
      );
    }

    // Analizar compatibilidad ATS
    const analysis = analyzeATSCompatibility(text);

    return NextResponse.json({
      success: true,
      analysis
    });

  } catch (error: any) {
    console.error("Error en análisis ATS:", error);
    return NextResponse.json(
      { error: error.message || "Error al analizar el CV" },
      { status: 500 }
    );
  }
}
