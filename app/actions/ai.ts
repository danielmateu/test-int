"use server";

import { auth } from "@/auth";
import { GoogleGenAI } from "@google/genai";

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
