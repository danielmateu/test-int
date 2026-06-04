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
      const isModelError =
        err?.status === 404 ||
        err?.message?.includes('404') ||
        err?.message?.includes('not found') ||
        err?.message?.includes('not supported') ||
        err?.message?.includes('NOT_FOUND');
      const isRetriable =
        err?.message?.includes('503') ||
        err?.message?.includes('UNAVAILABLE') ||
        err?.message?.includes('429') ||
        err?.message?.includes('RESOURCE_EXHAUSTED') ||
        err?.status === 503 ||
        err?.status === 429;
      if (!isRetriable && !isModelError) break; // Si no es por cuota/servidor saturado o error de modelo, salimos del bucle
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
      const isModelError =
        err?.status === 404 ||
        err?.message?.includes('404') ||
        err?.message?.includes('not found') ||
        err?.message?.includes('not supported') ||
        err?.message?.includes('NOT_FOUND');
      const isRetriable =
        err?.message?.includes('503') ||
        err?.message?.includes('UNAVAILABLE') ||
        err?.message?.includes('429') ||
        err?.message?.includes('RESOURCE_EXHAUSTED') ||
        err?.status === 503 ||
        err?.status === 429;
      if (!isRetriable && !isModelError) break;
      console.warn(`Gemini Model ${model} no disponible o saturado, intentando reintento con otro modelo...`);
    }
  }

  throw new Error(
    lastError?.message || "No se pudo adaptar tu currículum con IA. Por favor, inténtalo de nuevo en unos momentos."
  );
}

export async function generateInterviewQuestionsAction(
  cvData: any,
  jobTitle: string,
  company: string,
  jobDescription: string,
  locale: string = "es"
): Promise<string[]> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("No autorizado");
  }

  if (!apiKey) {
    throw new Error("La clave API de Gemini (GEMINI_API_KEY) no está configurada");
  }

  const ai = new GoogleGenAI({ apiKey });
  const isEn = locale.toLowerCase() === "en";

  // Extraer información del CV
  const skills = cvData?.skills || [];
  const experiences = cvData?.experience || [];
  const jobTitleCV = cvData?.personalInfo?.jobTitle || "Profesional";

  const expText = experiences.map((exp: any) => 
    `- Puesto: ${exp.role} en ${exp.company}. Descripción: ${exp.description}`
  ).join("\n");

  const skillsText = skills.join(", ");

  let systemPrompt = `Eres un seleccionador y reclutador de personal técnico de élite. Tu rol es simular entrevistas altamente efectivas.
Debes devolver ÚNICAMENTE un array JSON que contenga exactamente 5 preguntas personalizadas (behavioral, técnicas y situacionales) adaptadas para confrontar el CV del candidato con la vacante.`;

  if (isEn) {
    systemPrompt = `You are an elite technical recruiter and hiring manager. Your role is to conduct highly effective interviews.
You must return ONLY a JSON array containing exactly 5 tailored interview questions (behavioral, technical, and situational) customized to evaluate the candidate's CV against the job description.`;
  }

  let userPrompt = `
Genera 5 preguntas de entrevista de trabajo altamente específicas y desafiantes en el idioma "${locale}" (si 'es' genera en Español, si 'en' genera en Inglés, etc.).
Las preguntas deben evaluar si el candidato encaja con el puesto solicitado, basándose en la comparación entre su CV y la vacante de empleo.

DATOS DEL CANDIDATO (CV):
- Título profesional: ${jobTitleCV}
- Habilidades: ${skillsText}
- Experiencia laboral:
${expText || "No especificada"}

DATOS DE LA VACANTE:
- Puesto: ${jobTitle}
- Empresa: ${company}
- Descripción: ${jobDescription}

REGLAS DE PREGUNTAS:
1. Genera exactamente 5 preguntas.
2. 2 preguntas deben ser de comportamiento/actitud (ej. basadas en resolución de conflictos pasados o motivaciones).
3. 2 preguntas deben ser técnicas/situacionales específicas para la tecnología o puesto buscado.
4. 1 pregunta debe evaluar el encaje cultural y adaptación a la empresa "${company}".
5. Devuelve ÚNICAMENTE un array de cadenas JSON válido. Ej: ["Pregunta 1", "Pregunta 2", "Pregunta 3", "Pregunta 4", "Pregunta 5"].
6. NO incluyas explicaciones, marcadores de posición, ni bloques de markdown. Empieza con [ y termina con ].
`;

  if (isEn) {
    userPrompt = `
Generate 5 highly specific and challenging job interview questions in the language "${locale}" (if 'es' generate in Spanish, if 'en' generate in English, etc.).
The questions must evaluate whether the candidate is a great fit for the position, comparing their CV experience with the target job details.

CANDIDATE INFORMATION (CV):
- Job title: ${jobTitleCV}
- Skills: ${skillsText}
- Work Experience:
${expText || "Not specified"}

JOB DETAILS:
- Job Title: ${jobTitle}
- Company: ${company}
- Description: ${jobDescription}

QUESTION RULES:
1. Generate exactly 5 questions.
2. 2 questions must be behavioral/behavioral based (resolving conflicts, motivation).
3. 2 questions must be technical/situational specific to the target tools or role.
4. 1 question must evaluate cultural fit and alignment with the company "${company}".
5. Return ONLY a valid JSON string array. Example: ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"].
6. DO NOT include explanations or markdown wrappers. Start with [ and end with ].
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
      temperature: 0.5,
      responseMimeType: "application/json"
    },
  };

  let lastError: any;
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({ model, ...requestPayload });
      const rawText = response.text?.trim() || "";
      if (rawText) {
        let cleanedText = rawText;
        if (cleanedText.startsWith("```")) {
          cleanedText = cleanedText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
        }
        
        try {
          const questions = JSON.parse(cleanedText) as string[];
          if (Array.isArray(questions) && questions.length > 0) {
            return questions.slice(0, 5);
          }
        } catch (jsonErr) {
          console.error(`Error parsing questions JSON returned by ${model}:`, jsonErr);
        }
      }
    } catch (err: any) {
      lastError = err;
      const isModelError =
        err?.status === 404 ||
        err?.message?.includes('404') ||
        err?.message?.includes('not found') ||
        err?.message?.includes('not supported') ||
        err?.message?.includes('NOT_FOUND');
      const isRetriable =
        err?.message?.includes('503') ||
        err?.message?.includes('UNAVAILABLE') ||
        err?.message?.includes('429') ||
        err?.status === 503 ||
        err?.status === 429;
      if (!isRetriable && !isModelError) break;
      console.warn(`Gemini Model ${model} no disponible o saturado, intentando generar preguntas con otro modelo...`);
    }
  }

  throw new Error(
    lastError?.message || "No se pudieron generar las preguntas de entrevista con IA. Por favor, reintenta."
  );
}

export interface InterviewQuestionAnalysis {
  question: string;
  answer: string;
  feedback: string;
  idealAnswer: string;
}

export interface InterviewEvaluation {
  score: number;
  overallFeedback: string;
  analysis: InterviewQuestionAnalysis[];
}

export async function evaluateInterviewAnswersAction(
  cvData: any,
  jobTitle: string,
  company: string,
  jobDescription: string,
  QA: { question: string; answer: string }[],
  locale: string = "es"
): Promise<InterviewEvaluation> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("No autorizado");
  }

  if (!apiKey) {
    throw new Error("La clave API de Gemini (GEMINI_API_KEY) no está configurada");
  }

  const ai = new GoogleGenAI({ apiKey });
  const isEn = locale.toLowerCase() === "en";

  let systemPrompt = `Eres un evaluador de talento experto en selección de personal. Tu tarea es analizar las respuestas de un candidato en una entrevista de trabajo simulada.
Debes evaluar sus respuestas comparándolas con su currículum y con la vacante, y devolver ÚNICAMENTE un objeto JSON que siga estrictamente la estructura solicitada.`;

  if (isEn) {
    systemPrompt = `You are an expert talent acquisition manager and interviewer. Your task is to analyze a candidate's answers from a mock job interview.
You must evaluate their answers compared to their CV and the target job description, returning ONLY a valid JSON object matching the requested structure.`;
  }

  let userPrompt = `
Evalúa la entrevista simulada realizada por el candidato para el puesto de "${jobTitle}" en la empresa "${company}".
El idioma de tu feedback e informes debe ser estrictamente en "${locale}" (si 'es' en Español, si 'en' en Inglés, etc.).

PREGUNTAS REALIZADAS Y RESPUESTAS DEL CANDIDATO:
${QA.map((qa, i) => `Pregunta ${i + 1}: ${qa.question}\nRespuesta del candidato: ${qa.answer || "(Sin respuesta / Omitida)"}`).join("\n\n")}

VACANTE DETALLES:
- Puesto: ${jobTitle}
- Empresa: ${company}
- Descripción: ${jobDescription}

DEVUELVE UN OBJETO JSON EXACTAMENTE CON ESTA ESTRUCTURA (SIN INTRODUCCIONES NI BLOQUES DE MARKDOWN):
{
  "score": (número entero de 0 a 100 evaluando la calidad y madurez general de las respuestas),
  "overallFeedback": "Feedback general resumiendo los puntos fuertes clave detectados, las áreas de mejora globales y consejos prácticos de lenguaje corporal u oratoria.",
  "analysis": [
    {
      "question": "Pregunta 1...",
      "answer": "Respuesta dada...",
      "feedback": "Feedback constructivo específico para esta respuesta. Qué hizo bien, qué habilidades no explotó y cómo podría estructurarla mejor (usando metodología STAR si aplica).",
      "idealAnswer": "Un ejemplo redactado de forma profesional de cómo se debería haber contestado idealmente a esta pregunta utilizando la experiencia sugerida del CV del candidato."
    },
    ... (repetir para las 5 preguntas)
  ]
}
`;

  if (isEn) {
    userPrompt = `
Evaluate the mock interview conducted by the candidate for the "${jobTitle}" position at "${company}".
The language of your feedback and evaluation must be strictly in "${locale}" (if 'es' in Spanish, if 'en' in English, etc.).

QUESTIONS ASKED & CANDIDATE ANSWERS:
${QA.map((qa, i) => `Question ${i + 1}: ${qa.question}\nCandidate Answer: ${qa.answer || "(No answer provided / Skipped)"}`).join("\n\n")}

JOB DESCRIPTION:
- Title: ${jobTitle}
- Company: ${company}
- Description: ${jobDescription}

RETURN A VALID JSON OBJECT WITH THIS EXACT STRUCTURE (NO MARKDOWN WRAAPERS, NO EXPLANATIONS):
{
  "score": (integer score from 0 to 100 based on the quality and depth of the answers),
  "overallFeedback": "Overall feedback summarizing key strengths, major improvement areas, and practical communication tips.",
  "analysis": [
    {
      "question": "Question 1...",
      "answer": "Candidate answer...",
      "feedback": "Specific constructive feedback for this answer. What went well, what skills were neglected, and how to structure it better (e.g. using STAR method).",
      "idealAnswer": "A professional mock ideal answer showing how the candidate should have answered this question leveraging their CV background."
    },
    ... (repeat for all 5 questions)
  ]
}
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
      temperature: 0.35,
      responseMimeType: "application/json"
    },
  };

  let lastError: any;
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({ model, ...requestPayload });
      const rawText = response.text?.trim() || "";
      if (rawText) {
        let cleanedText = rawText;
        if (cleanedText.startsWith("```")) {
          cleanedText = cleanedText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
        }
        
        try {
          const evalRes = JSON.parse(cleanedText) as InterviewEvaluation;
          if (evalRes && typeof evalRes.score === 'number' && Array.isArray(evalRes.analysis)) {
            return evalRes;
          }
        } catch (jsonErr) {
          console.error(`Error parsing interview evaluation JSON returned by ${model}:`, jsonErr);
        }
      }
    } catch (err: any) {
      lastError = err;
      const isModelError =
        err?.status === 404 ||
        err?.message?.includes('404') ||
        err?.message?.includes('not found') ||
        err?.message?.includes('not supported') ||
        err?.message?.includes('NOT_FOUND');
      const isRetriable =
        err?.message?.includes('503') ||
        err?.message?.includes('UNAVAILABLE') ||
        err?.message?.includes('429') ||
        err?.status === 503 ||
        err?.status === 429;
      if (!isRetriable && !isModelError) break;
      console.warn(`Gemini Model ${model} no disponible o saturado, intentando evaluar con otro modelo...`);
    }
  }

  throw new Error(
    lastError?.message || "No se pudo evaluar la entrevista con IA. Por favor, reintenta."
  );
}

export interface ATSJobFitAnalysis {
  score: number;
  matchingKeywords: string[];
  missingKeywords: string[];
  suggestions: {
    section: "summary" | "experience" | "skills" | "projects" | "other";
    tip: string;
    phrasing?: string;
  }[];
}

export async function analyzeATSJobFitAction(
  cvData: CVData,
  jobDescription: string,
  locale: string = "es"
): Promise<ATSJobFitAnalysis> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("No autorizado");
  }

  if (!apiKey) {
    throw new Error("La clave API de Gemini (GEMINI_API_KEY) no está configurada");
  }

  const ai = new GoogleGenAI({ apiKey });
  const isEn = locale.toLowerCase() === "en";

  // Extraer información relevante del CV
  const summary = cvData.personalInfo?.summary || "";
  const skills = cvData.skills || [];
  const experiences = cvData.experience || [];
  const projects = cvData.projects || [];
  const other = cvData.other || "";

  const expText = experiences.map((exp: any) => 
    `- Puesto: ${exp.role} en ${exp.company}. Descripción: ${exp.description}`
  ).join("\n");

  const projText = (projects || []).map((proj: any) => 
    `- Proyecto: ${proj.name}. Descripción: ${proj.description}`
  ).join("\n");

  const skillsText = skills.join(", ");

  let systemPrompt = `Eres un sistema experto ATS (Applicant Tracking System) y analista de selección de personal. Tu rol es auditar currículums en comparación con ofertas de empleo.
Debes devolver ÚNICAMENTE un objeto JSON estructurado que evalúe y compare el CV del candidato contra la descripción del empleo provista.`;

  if (isEn) {
    systemPrompt = `You are an expert ATS (Applicant Tracking System) auditor and recruitment analyst. Your role is to audit resumes in comparison with job offers.
You must return ONLY a structured JSON object that evaluates and compares the candidate's CV against the provided job description.`;
  }

  let userPrompt = `
Analiza el currículum del candidato y compáralo con la descripción del empleo provista.
El idioma de tu análisis y de todas tus sugerencias debe ser estrictamente en "${locale}" (si 'es' en Español, si 'en' en Inglés, etc.).

INFORMACIÓN DEL CANDIDATO (CV):
- Perfil Profesional (Summary): ${summary}
- Habilidades: ${skillsText}
- Experiencia laboral:
${expText || "Ninguna registrada"}
- Proyectos personales:
${projText || "Ninguno registrado"}
- Otros datos: ${other}

INFORMACIÓN DE LA OFERTA DE EMPLEO (JOB DESCRIPTION):
${jobDescription}

REGLAS DE ANÁLISIS:
1. Extrae hasta 12 a 15 palabras clave/conceptos críticos del puesto (tecnologías, herramientas, metodologías, certificaciones o habilidades blandas clave).
2. Compara si esas palabras clave o sus sinónimos directos están presentes de alguna forma en el CV del candidato.
3. Clasifícalas en:
   - "matchingKeywords": Palabras clave críticas que SÍ están en el CV.
   - "missingKeywords": Palabras clave críticas que están en la oferta de empleo pero NO se mencionan o no se destacan en el CV.
4. Calcula un "score" numérico entero de 0 a 100 de coincidencia basado en la proporción y relevancia de palabras clave encontradas y el encaje general.
5. Genera de 3 a 5 "suggestions" (sugerencias) específicas para ayudar al candidato a incorporar las palabras clave ausentes ("missingKeywords") en diferentes secciones del CV de forma natural. Cada sugerencia debe indicar la sección ("summary", "experience", "skills", "projects", "other"), dar un consejo práctico ("tip") y proporcionar una frase de ejemplo redactada profesionalmente ("phrasing") para ser integrada.

DEVUELVE UN OBJETO JSON EXACTAMENTE CON ESTA ESTRUCTURA (SIN INTRODUCCIONES NI BLOQUES DE MARKDOWN):
{
  "score": (número entero de 0 a 100),
  "matchingKeywords": ["Keyword1", "Keyword2", ...],
  "missingKeywords": ["MissingKeyword1", "MissingKeyword2", ...],
  "suggestions": [
    {
      "section": "skills", // O "summary", "experience", "projects", "other"
      "tip": "Añade '...' a tus habilidades si tienes conocimientos prácticos del tema.",
      "phrasing": "..." // Opcional, sugerencia de frase o término exacto a inyectar
    },
    ...
  ]
}
`;

  if (isEn) {
    userPrompt = `
Analyze the candidate's resume and compare it against the provided job description.
The language of your analysis and suggestions must be strictly in "${locale}" (if 'es' in Spanish, if 'en' in English, etc.).

CANDIDATE INFORMATION (CV):
- Professional Summary: ${summary}
- Skills: ${skillsText}
- Work Experience:
${expText || "None specified"}
- Projects:
${projText || "None specified"}
- Other info: ${other}

JOB DESCRIPTION DETAILS:
${jobDescription}

ANALYSIS RULES:
1. Extract 12 to 15 critical keywords/skills from the job description (technologies, tools, frameworks, certifications, or key soft skills).
2. Check if those keywords or their direct synonyms are present in the candidate's CV text.
3. Classify them into:
   - "matchingKeywords": Critical keywords that ARE present in the CV.
   - "missingKeywords": Critical keywords required by the employer that are NOT found or highlighted in the CV.
4. Calculate a matching "score" (integer 0-100) based on the presence and critical importance of the found keywords.
5. Create 3 to 5 targeted "suggestions" to help the user incorporate the "missingKeywords" in a natural way. For each suggestion, provide the target section ("summary", "experience", "skills", "projects", "other"), an actionable advice ("tip"), and a professionally written example phrase ("phrasing") that the candidate can copy/paste or adapt.

RETURN A VALID JSON OBJECT WITH THIS EXACT STRUCTURE (NO MARKDOWN WRAPPERS, NO EXPLANATIONS):
{
  "score": (integer 0-100),
  "matchingKeywords": ["Keyword1", "Keyword2", ...],
  "missingKeywords": ["MissingKeyword1", "MissingKeyword2", ...],
  "suggestions": [
    {
      "section": "skills",
      "tip": "Add '...' to your skills list if you possess practical experience.",
      "phrasing": "..."
    },
    ...
  ]
}
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
      temperature: 0.25,
      responseMimeType: "application/json"
    },
  };

  let lastError: any;
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({ model, ...requestPayload });
      const rawText = response.text?.trim() || "";
      if (rawText) {
        let cleanedText = rawText;
        if (cleanedText.startsWith("```")) {
          cleanedText = cleanedText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
        }
        
        try {
          const analysisRes = JSON.parse(cleanedText) as ATSJobFitAnalysis;
          if (analysisRes && typeof analysisRes.score === 'number' && Array.isArray(analysisRes.matchingKeywords) && Array.isArray(analysisRes.missingKeywords)) {
            return analysisRes;
          }
        } catch (jsonErr) {
          console.error(`Error parsing ATS fit analysis JSON returned by ${model}:`, jsonErr);
        }
      }
    } catch (err: any) {
      lastError = err;
      const isModelError =
        err?.status === 404 ||
        err?.message?.includes('404') ||
        err?.message?.includes('not found') ||
        err?.message?.includes('not supported') ||
        err?.message?.includes('NOT_FOUND');
      const isRetriable =
        err?.message?.includes('503') ||
        err?.message?.includes('UNAVAILABLE') ||
        err?.message?.includes('429') ||
        err?.status === 503 ||
        err?.status === 429;
      if (!isRetriable && !isModelError) break;
      console.warn(`Gemini Model ${model} no disponible o saturado, intentando análisis ATS con otro modelo...`);
    }
  }

  throw new Error(
    lastError?.message || "No se pudo realizar el análisis de coincidencia ATS con IA. Por favor, reintenta."
  );
}

/**
 * Traduce contextualmente un currículum completo en formato JSON a otro idioma usando IA (Gemini)
 */
export async function translateCVAction(
  cvData: CVData,
  targetLocale: string
): Promise<CVData> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("No autorizado");
  }

  if (!apiKey) {
    throw new Error("La clave API de Gemini (GEMINI_API_KEY) no está configurada");
  }

  const ai = new GoogleGenAI({ apiKey });

  const languageMap: Record<string, string> = {
    es: "Español",
    en: "Inglés (English)",
    fr: "Francés (French)",
    de: "Alemán (German)",
    it: "Italiano (Italian)",
    pt: "Portugués (Portuguese)",
    ca: "Catalán (Catalan)"
  };

  const targetLanguageName = languageMap[targetLocale] || targetLocale;

  const systemPrompt = `Eres un traductor profesional y especialista en reclutamiento.
Tu tarea es traducir un currículum (CV) completo provisto en formato JSON al idioma: "${targetLanguageName}".

REGLAS DE TRADUCCIÓN ESTRICTAS:
1. Traduce TODOS los valores de texto descriptivos, resúmenes profesionales, logros en las experiencias, títulos de proyectos, nombres de carreras/grados académicos y secciones de otros datos al idioma de destino.
2. Mantén la estructura de llaves/claves JSON exactamente idéntica. No traduzcas ninguna clave del JSON (ej. no traduzcas 'personalInfo', 'experience', 'startDate', 'fullName', 'skills', etc.), solo traduce los valores.
3. No traduzcas nombres propios de personas (como el valor de 'fullName'), direcciones de correo, enlaces de redes sociales (LinkedIn, GitHub, etc.), URLs de imágenes, colores hexadecimales ni tipografías.
4. Traduce términos de fechas de forma natural, por ejemplo "Presente" o "Actualidad" debe traducirse como "Present" o "Presente" según corresponda al idioma.
5. Devuelve ÚNICAMENTE el objeto JSON traducido y estructurado de forma limpia. NO envuelvas la respuesta en bloques de código markdown de tipo \`\`\`json. La respuesta debe comenzar estrictamente con '{' y terminar con '}'.`;

  const userPrompt = `
Por favor, traduce el siguiente currículum en formato JSON al idioma "${targetLanguageName}":

${JSON.stringify(cvData, null, 2)}
`;

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
      temperature: 0.1, // Temperatura baja para traducciones fieles y estables
      responseMimeType: "application/json"
    },
  };

  let lastError: any;
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({ model, ...requestPayload });
      const rawText = response.text?.trim() || "";
      if (rawText) {
        let cleanedText = rawText;
        if (cleanedText.startsWith("```")) {
          cleanedText = cleanedText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
        }
        
        try {
          const translatedCV = JSON.parse(cleanedText) as CVData;
          if (translatedCV && translatedCV.personalInfo) {
            return translatedCV;
          }
        } catch (jsonErr) {
          console.error(`Error parsing translation JSON returned by ${model}:`, jsonErr);
        }
      }
    } catch (err: any) {
      lastError = err;
      const isModelError =
        err?.status === 404 ||
        err?.message?.includes('404') ||
        err?.message?.includes('not found') ||
        err?.message?.includes('not supported') ||
        err?.message?.includes('NOT_FOUND');
      const isRetriable =
        err?.message?.includes('503') ||
        err?.message?.includes('UNAVAILABLE') ||
        err?.message?.includes('429') ||
        err?.status === 503 ||
        err?.status === 429;
      if (!isRetriable && !isModelError) break;
      console.warn(`Gemini Model ${model} no disponible o saturado, intentando traducción con otro modelo...`);
    }
  }

  throw new Error(
    lastError?.message || "No se pudo traducir el currículum con IA. Por favor, reintenta en unos momentos."
  );
}

/**
 * Asistente de redacción inteligente (Copiloto IA) para generar o refinar secciones del currículum
 */
export async function generateCopilotContentAction(
  prompt: string,
  actionType: "generate" | "improve" | "shorten" | "star" | "grammar",
  sectionContext: string,
  locale: string = "es"
): Promise<string> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("No autorizado");
  }

  if (!apiKey) {
    throw new Error("La clave API de Gemini (GEMINI_API_KEY) no está configurada");
  }

  const ai = new GoogleGenAI({ apiKey });

  const isEn = locale.toLowerCase() === "en";

  let systemPrompt = "Eres un redactor experto en talento, reclutamiento y optimización de currículums (CV). ";
  if (isEn) {
    systemPrompt = "You are a professional resume writer, talent acquisition specialist, and CV optimizer. ";
  }

  let instructions = "";
  if (actionType === "generate") {
    instructions = isEn
      ? `Generate high-quality CV content from scratch based on the user's prompt: "${prompt}". `
      : `Genera contenido de alta calidad para un currículum desde cero basado en la instrucción del usuario: "${prompt}". `;
  } else if (actionType === "improve") {
    instructions = isEn
      ? `Improve the following text, making it sound more professional, impactful, and written with strong action verbs: "${prompt}". `
      : `Mejora el siguiente texto, haciendo que suene más profesional, impactante y redactado con verbos de acción fuertes: "${prompt}". `;
  } else if (actionType === "shorten") {
    instructions = isEn
      ? `Make the following text shorter, concise, and direct, preserving key information and achievements: "${prompt}". `
      : `Haz el siguiente texto más corto, conciso y directo, preservando la información y logros clave: "${prompt}". `;
  } else if (actionType === "star") {
    instructions = isEn
      ? `Structure and rewrite the following text using the STAR method (Situation, Task, Action, Result) focusing on measurable metrics and achievements: "${prompt}". `
      : `Estructura y redacta el siguiente texto usando el método STAR (Situación, Tarea, Acción, Resultado) enfocándote en métricas y logros medibles: "${prompt}". `;
  } else if (actionType === "grammar") {
    instructions = isEn
      ? `Correct any spelling, grammar, and syntax errors in the following text, polishing it to professional quality: "${prompt}". `
      : `Corrige cualquier error ortográfico, gramatical y sintáctico en el siguiente texto, puliéndolo hasta lograr calidad profesional: "${prompt}". `;
  }

  // Pautas de contexto de sección
  let contextGuideline = "";
  if (sectionContext === "summary") {
    contextGuideline = isEn
      ? "This is for the Professional Summary section. Write a cohesive, short paragraph (3-4 lines maximum) highlighting key value, years of experience, and main domains."
      : "Esto es para la sección de Perfil Profesional. Escribe un párrafo cohesivo y corto (máximo 3-4 líneas) que destaque el valor clave, años de experiencia y áreas principales de especialización.";
  } else if (sectionContext === "experience") {
    contextGuideline = isEn
      ? "This is for the Work Experience description. Use clear bullet points starting with strong action verbs (e.g., Led, Developed, Optimized) highlighting responsibilities and measurable outcomes."
      : "Esto es para la descripción de Experiencia Laboral. Utiliza viñetas claras que comiencen con verbos de acción fuertes (ej. Lideré, Desarrollé, Optimicé) destacando responsabilidades y resultados medibles.";
  } else if (sectionContext === "education") {
    contextGuideline = isEn
      ? "This is for the Education description. Highlight major subjects, skills acquired, relevant academic projects, or honors."
      : "Esto es para la descripción de Formación Académica. Destaca materias principales, habilidades adquiridas, proyectos académicos relevantes o menciones de honor.";
  } else if (sectionContext === "projects") {
    contextGuideline = isEn
      ? "This is for a Project description. Detail the project goal, key technologies used, your specific role, and the results or impact achieved."
      : "Esto es para la descripción de un Proyecto. Detalla el objetivo del proyecto, tecnologías clave empleadas, tu rol específico y los resultados o impacto logrados.";
  } else if (sectionContext === "skills") {
    contextGuideline = isEn
      ? "This is for the Skills section. List relevant, modern keywords or tool names separated by commas."
      : "Esto es para la sección de Habilidades. Lista palabras clave o herramientas relevantes y modernas separadas por comas.";
  } else if (sectionContext === "coverLetter") {
    contextGuideline = isEn
      ? "This is for a Cover Letter. Write a professional, polite, and persuasive letter draft."
      : "Esto es para una Carta de Presentación. Redacta un borrador de carta profesional, formal y persuasivo.";
  }

  const finalPrompt = `
${instructions}
${contextGuideline}

REGLAS ESTRICTAS DE SALIDA:
1. Devuelve ÚNICAMENTE el texto redactado/mejorado final. No incluyas explicaciones previas ni posteriores, no pongas introducciones del tipo "Aquí tienes tu texto:", ni comillas decorativas envolviendo el resultado.
2. Escribe estrictamente en el idioma correspondiente al locale "${locale}".
`;

  const models = [
    'gemini-3.1-flash-lite',
    'gemini-3.0-flash',
    'gemini-3.1-pro',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
  ];

  const requestPayload = {
    contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
    config: { 
      systemInstruction: systemPrompt, 
      temperature: 0.7 
    },
  };

  let lastError: any;
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({ model, ...requestPayload });
      const rawText = response.text?.trim() || "";
      if (rawText) {
        return rawText;
      }
    } catch (err: any) {
      lastError = err;
      const isModelError =
        err?.status === 404 ||
        err?.message?.includes('404') ||
        err?.message?.includes('not found') ||
        err?.message?.includes('not supported') ||
        err?.message?.includes('NOT_FOUND');
      const isRetriable =
        err?.message?.includes('503') ||
        err?.message?.includes('UNAVAILABLE') ||
        err?.message?.includes('429') ||
        err?.status === 503 ||
        err?.status === 429;
      if (!isRetriable && !isModelError) break;
      console.warn(`Gemini Model ${model} no disponible, intentando con otro...`);
    }
  }

  throw new Error(
    lastError?.message || "No se pudo generar el texto con el copiloto IA. Inténtalo de nuevo."
  );
}

