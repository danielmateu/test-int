"use server";

import { auth } from "@/auth";
import { GoogleGenAI } from "@google/genai";
import type { CVData } from "@/components/cv-builder/types";

// Inicializamos el cliente de IA reutilizando la API Key de tu proyecto
const apiKey = process.env.GEMINI_API_KEY || "";

export async function generateCoverLetterAction(
  cvData: any,
  jobTitle: string,
  company: string,
  jobDescription: string,
  locale: string = "es"
): Promise<string> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("No autorizado");
  }

  if (!apiKey) {
    throw new Error("La clave API de Gemini (GEMINI_API_KEY) no está configurada en .env.local");
  }

  const ai = new GoogleGenAI({ apiKey });

  // 1. Extraer datos relevantes del CV para alimentar a la IA
  const personalInfo = cvData?.personalInfo || {};
  const skills = cvData?.skills || [];
  const experiences = cvData?.experience || [];
  const educationList = cvData?.education || [];

  const experienceText = experiences.map((exp: any) => 
    `- Puesto: ${exp.role} en ${exp.company} (${exp.startDate} - ${exp.endDate || 'Actual'}). Descripción: ${exp.description}`
  ).join("\n");

  const educationText = educationList.map((edu: any) => 
    `- Título: ${edu.degree} en ${edu.institution} (${edu.startDate} - ${edu.endDate || 'Actual'})`
  ).join("\n");

  const userSkillsText = skills.join(", ");

  // 2. Definir system instruction y prompt especializado basado en el locale
  const isEn = locale.toLowerCase() === "en";
  
  let systemPrompt = "Eres un redactor experto en talento y selección de personal especializado en la redacción de cartas de presentación altamente persuasivas. ";
  if (isEn) {
    systemPrompt = "You are a professional talent acquisition and career writing expert specialized in writing highly persuasive and professional cover letters. ";
  }

  let userPrompt = `
Escribe una carta de presentación elegante, profesional y convincente para unirse a la empresa "${company}" en el puesto de "${jobTitle}".
La carta debe alinear de forma inteligente las habilidades y logros del candidato con la descripción del empleo provista.

DATOS DEL CANDIDATO (EXTRAÍDOS DE SU CV):
- Nombre del candidato: ${personalInfo.fullName || session.user.name || "Candidato"}
- Puesto/Título actual: ${personalInfo.jobTitle || "Profesional"}
- Perfil Profesional: ${personalInfo.summary || ""}
- Habilidades clave: ${userSkillsText}
- Experiencia laboral:
${experienceText || "No especificada"}
- Educación y formación:
${educationText || "No especificada"}

DESCRIPCIÓN DE LA OFERTA DE EMPLEO DE LA EMPRESA:
- Puesto solicitado: ${jobTitle}
- Empresa: ${company}
- Descripción del puesto: ${jobDescription}

REGLAS DE REDACCIÓN DE LA CARTA:
1. Redacta la carta en el idioma correspondiente a "${locale}" (si es 'es' redacta en Español, si es 'en' redacta en Inglés, etc.). Usa un tono formal, elegante y persuasivo.
2. Enfócate en cómo los logros pasados y las habilidades del candidato resolverán las necesidades de la oferta.
3. No uses corchetes ni marcadores de posición genéricos como "[Fecha]", "[Nombre de la empresa]" o "[Tu Nombre]". Rellena estos campos dinámicamente o estructúrala de tal forma que fluya de manera nativa y lista para enviar.
4. Usa el nombre del candidato "${personalInfo.fullName || session.user.name || "Candidato"}" para firmar la carta al final de forma profesional.
5. Devuelve ÚNICAMENTE el texto redactado de la carta de presentación, sin introducciones explicativas, sin comentarios adicionales y sin comillas decorativas al principio ni al final.
`;

  if (isEn) {
    userPrompt = `
Write an elegant, professional, and compelling cover letter to apply for the "${jobTitle}" position at "${company}".
The letter must intelligently align the candidate's skills and achievements with the provided job description.

CANDIDATE INFORMATION (EXTRACTED FROM CV):
- Candidate Name: ${personalInfo.fullName || session.user.name || "Candidate"}
- Current Title: ${personalInfo.jobTitle || "Professional"}
- Professional Profile Summary: ${personalInfo.summary || ""}
- Key Skills: ${userSkillsText}
- Work Experience:
${experienceText || "Not specified"}
- Education:
${educationText || "Not specified"}

JOB OFFER DETAILS:
- Job Title: ${jobTitle}
- Company: ${company}
- Job Description: ${jobDescription}

WRITING RULES:
1. Write the letter strictly in the language code "${locale}" (if 'es' write in Spanish, if 'en' write in English, etc.). Use a formal, elegant, and persuasive tone.
2. Focus on how the candidate's past achievements and skills solve the employer's needs.
3. DO NOT use generic placeholders or brackets like "[Date]", "[Company Name]", or "[Your Name]". Fill them in dynamically or structure the letter so it reads natively and is ready to send.
4. Sign off the letter professionally at the end using the candidate's name: "${personalInfo.fullName || session.user.name || "Candidate"}".
5. Return ONLY the final text of the cover letter. Do not include any explanations, introduction remarks, or surrounding quotation marks.
`;
  }

  // 3. Ejecutar el bucle de fallback de modelos para máxima robustez
  const models = [
    'gemini-3.1-flash-lite',  // Rápido y alta disponibilidad
    'gemini-3.0-flash',
    'gemini-3.1-pro',
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
  ];

  const requestPayload = {
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    config: { systemInstruction: systemPrompt, temperature: 0.75 },
  };

  let lastError: any;
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({ model, ...requestPayload });
      const generatedLetter = response.text?.trim() || "";
      if (generatedLetter) {
        return generatedLetter;
      }
    } catch (err: any) {
      lastError = err;
      const isRetriable =
        err?.message?.includes('503') ||
        err?.message?.includes('UNAVAILABLE') ||
        err?.message?.includes('429') ||
        err?.message?.includes('RESOURCE_EXHAUSTED') ||
        err?.status === 503 ||
        err?.status === 429;
      if (!isRetriable) break; // Si no es por cuota/servidor saturado, salimos del bucle
      console.warn(`Gemini Model ${model} saturado o no disponible, intentando con el siguiente...`);
    }
  }

  throw new Error(
    lastError?.message || "No se pudo generar la carta de presentación con IA. Por favor, inténtalo de nuevo."
  );
}

export async function tailorCVAction(
  cvData: CVData,
  jobTitle: string,
  company: string,
  jobDescription: string,
  locale: string = "es"
): Promise<CVData> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("No autorizado");
  }

  if (!apiKey) {
    throw new Error("La clave API de Gemini (GEMINI_API_KEY) no está configurada en .env.local");
  }

  const ai = new GoogleGenAI({ apiKey });

  const isEn = locale.toLowerCase() === "en";

  let systemPrompt = `Eres un redactor experto en talento y selección de personal especializado en la optimización y adaptación de currículums (CV) para ofertas de empleo.
Tu tarea es recibir el JSON de un CV y la descripción de una vacante, y devolver un nuevo objeto JSON con el CV adaptado y optimizado para ese empleo específico.
REGLAS ESTRICTAS DE RESPUESTA:
1. Debes responder ÚNICAMENTE con un bloque de texto JSON limpio y válido.
2. NO incluyas introducciones, explicaciones ni bloques de markdown (sin tres comillas simples ni "json" al principio). La respuesta debe empezar estrictamente con '{' y terminar con '}'.
3. El JSON devuelto debe seguir exactamente la misma estructura que el recibido.`;

  if (isEn) {
    systemPrompt = `You are a professional talent acquisition and career writing expert specialized in optimizing and tailoring resumes (CVs) for specific job offers.
Your task is to take a candidate's CV JSON and a target job description, and return a new JSON object representing the adapted and optimized CV for that specific job.
STRICT RESPONSE RULES:
1. You must respond ONLY with a clean and valid JSON string.
2. DO NOT include any introductions, explanations, or markdown code blocks (no triple backticks or "json" tags). The response must strictly begin with '{' and end with '}'.
3. The returned JSON must perfectly match the structure of the input JSON.`;
  }

  let userPrompt = `
Por favor, adapta el siguiente currículum (CV) en formato JSON para que encaje perfectamente con la oferta de empleo provista.

JSON DEL CV ORIGINAL DEL CANDIDATO:
${JSON.stringify(cvData, null, 2)}

DETALLES DE LA OFERTA DE EMPLEO OBJETIVO:
- Puesto/Título: ${jobTitle}
- Empresa: ${company}
- Descripción del empleo: ${jobDescription}

REGLAS DE ADAPTACIÓN:
1. Idioma de redacción: Redacta la adaptación estrictamente en el idioma correspondiente a "${locale}" (si es 'es' en Español, si es 'en' en Inglés, etc.).
2. Campos a modificar obligatoriamente:
   - 'personalInfo.summary': Reescribe el perfil profesional (unas 3-5 líneas) para alinearlo fuertemente con la vacante, destacando las habilidades y logros del candidato más pertinentes para esta vacante de forma persuasiva.
   - 'personalInfo.jobTitle': Si es adecuado y realista, ajústalo para que concuerde con el título de la oferta o se asemeje a ella (sin mentir).
   - 'experience': Para cada experiencia laboral de la lista, optimiza el campo 'description'. Utiliza palabras clave de la oferta y destaca los logros que tengan mayor relación con lo buscado. ¡ATENCIÓN! Mantén el 'id', 'company', 'role', 'startDate' y 'endDate' exactamente iguales a los originales.
   - 'skills': Analiza la oferta e inyecta en la lista las habilidades clave solicitadas en las que el candidato tenga competencia en base a su CV. Reordena la lista de habilidades para priorizar las más críticas para esta oferta.
3. Campos que DEBEN permanecer 100% IDÉNTICOS sin ningún cambio:
   - 'personalInfo.fullName', 'personalInfo.email', 'personalInfo.phone', 'personalInfo.location', 'personalInfo.imageUrl', 'personalInfo.githubUrl', 'personalInfo.linkedinUrl', 'personalInfo.portfolioUrl', 'personalInfo.xUrl'
   - Todo el bloque 'education' (estudios)
   - Todo el bloque 'projects' (proyectos)
   - El campo 'other'
   - El bloque 'theme' (diseño y colores)
   - El campo 'coverLetter'
4. Asegúrate de devolver un JSON válido y bien estructurado que comience con '{' y termine con '}'.
`;

  if (isEn) {
    userPrompt = `
Please adapt the following candidate's CV in JSON format to match the target job description.

ORIGINAL CV JSON:
${JSON.stringify(cvData, null, 2)}

TARGET JOB DETAILS:
- Job Title: ${jobTitle}
- Company: ${company}
- Job Description: ${jobDescription}

TAILORING RULES:
1. Language: Write the adapted fields strictly in the language code "${locale}" (if 'es' in Spanish, if 'en' in English, etc.).
2. Fields you MUST modify:
   - 'personalInfo.summary': Rewrite the professional summary (3-5 lines) to align closely with the job requirements, highlighting achievements and skills relevant to this vacancy in a persuasive tone.
   - 'personalInfo.jobTitle': If realistic, adjust it to match or align closely with the target job title.
   - 'experience': For each work experience item in the array, optimize the 'description'. Highlight achievements and use keywords relevant to the target job. CRITICAL: Keep 'id', 'company', 'role', 'startDate', and 'endDate' exactly identical to the originals.
   - 'skills': Analyze the vacancy and append key skills required by the employer that match the candidate's background. Reorder the list to prioritize the most relevant skills.
3. Fields that MUST remain 100% IDENTICAL and untouched:
   - 'personalInfo.fullName', 'personalInfo.email', 'personalInfo.phone', 'personalInfo.location', 'personalInfo.imageUrl', 'personalInfo.githubUrl', 'personalInfo.linkedinUrl', 'personalInfo.portfolioUrl', 'personalInfo.xUrl'
   - 'education' array
   - 'projects' array
   - 'other' field
   - 'theme' object
   - 'coverLetter' field
4. Ensure you return ONLY a valid and well-structured JSON starting with '{' and ending with '}'.
`;
  }

  const models = [
    'gemini-3.1-flash-lite',
    'gemini-3.0-flash',
    'gemini-3.1-pro',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
  ];

  const requestPayload = {
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    config: { 
      systemInstruction: systemPrompt, 
      temperature: 0.2, // Temperatura baja para respuestas más estructuradas y precisas
      responseMimeType: "application/json"
    },
  };

  let lastError: any;
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({ model, ...requestPayload });
      const rawText = response.text?.trim() || "";
      if (rawText) {
        // Limpiamos posibles bloques markdown en la respuesta por seguridad
        let cleanedText = rawText;
        if (cleanedText.startsWith("```")) {
          cleanedText = cleanedText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
        }
        
        try {
          const adaptedCV = JSON.parse(cleanedText) as CVData;
          // Validamos que tenga la estructura mínima esperada
          if (adaptedCV && adaptedCV.personalInfo) {
            return adaptedCV;
          }
        } catch (jsonErr) {
          console.error(`Error parsing JSON returned by ${model}:`, jsonErr);
        }
      }
    } catch (err: any) {
      lastError = err;
      const isRetriable =
        err?.message?.includes('503') ||
        err?.message?.includes('UNAVAILABLE') ||
        err?.message?.includes('429') ||
        err?.message?.includes('RESOURCE_EXHAUSTED') ||
        err?.status === 503 ||
        err?.status === 429;
      if (!isRetriable) break;
      console.warn(`Gemini Model ${model} ocupado, intentando reintento de adaptación con otro modelo...`);
    }
  }

  throw new Error(
    lastError?.message || "No se pudo adaptar tu currículum con IA. Por favor, inténtalo de nuevo en unos momentos."
  );
}
