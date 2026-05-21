import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { text, context } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "No text provided" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    let systemPrompt = "Eres un experto en redacción de currículums y selección de personal. ";
    
    switch (context) {
      case "summary":
        systemPrompt += "Mejora el siguiente perfil profesional. Hazlo conciso, impactante, destacando el valor del candidato. Usa un tono formal y profesional. Devuelve ÚNICAMENTE el texto mejorado, sin introducciones ni comillas.";
        break;
      case "experience":
        systemPrompt += "Mejora la siguiente descripción de experiencia laboral. Usa verbos de acción fuertes, enfócate en logros y responsabilidades clave. Haz que suene muy profesional. Devuelve ÚNICAMENTE el texto mejorado, sin introducciones ni comillas.";
        break;
      case "education":
        systemPrompt += "Mejora la siguiente descripción de formación académica. Enfócate en las habilidades adquiridas, proyectos relevantes o logros destacados durante los estudios. Haz que suene muy profesional. Devuelve ÚNICAMENTE el texto mejorado, sin introducciones ni comillas.";
        break;
      case "coverLetter":
        systemPrompt += "Mejora la siguiente carta de presentación. Hazla persuasiva, educada y directa. Mejora el vocabulario y la fluidez. Devuelve ÚNICAMENTE el texto mejorado, sin introducciones ni comillas.";
        break;
      case "projects":
      case "project":
        systemPrompt += "Mejora la siguiente descripción de un proyecto personal o profesional. Resalta el objetivo, tecnologías clave empleadas, tu rol y los resultados logrados. Haz que suene muy profesional y técnico. Devuelve ÚNICAMENTE el texto mejorado, sin introducciones ni comillas.";
        break;
      case "other":
      case "others":
        systemPrompt += "Mejora y da formato profesional a la siguiente sección adicional (idiomas, intereses, certificaciones, etc.) para que se vea estructurada, pulida y elegante. Devuelve ÚNICAMENTE el texto mejorado, sin introducciones ni comillas.";
        break;
      default:
        systemPrompt += "Mejora profesionalmente el siguiente texto para un currículum vitae. Devuelve ÚNICAMENTE el texto mejorado, sin introducciones.";
    }

    const models = [
      'gemini-3.1-flash-lite',  // rápido, más cuota disponible
      'gemini-3.0-flash',
      'gemini-3.1-pro',
      'gemini-2.5-pro',
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
    ];
    const requestPayload = {
      contents: [{ role: 'user', parts: [{ text }] }],
      config: { systemInstruction: systemPrompt, temperature: 0.7 },
    };

    let lastError: any;
    for (const model of models) {
      try {
        const response = await ai.models.generateContent({ model, ...requestPayload });
        const enhancedText = response.text?.trim() || text;
        return NextResponse.json({ text: enhancedText });
      } catch (err: any) {
        lastError = err;
        const isRetriable =
          err?.message?.includes('503') ||
          err?.message?.includes('UNAVAILABLE') ||
          err?.message?.includes('429') ||
          err?.message?.includes('RESOURCE_EXHAUSTED') ||
          err?.status === 503 ||
          err?.status === 429;
        if (!isRetriable) break; // Only retry on overload/quota errors
        console.warn(`Model ${model} unavailable, trying next...`);
      }
    }

    throw lastError;
  } catch (error: any) {
    console.error("AI Enhance Error:", error);
    const isOverloaded =
      error?.message?.includes('503') ||
      error?.message?.includes('UNAVAILABLE') ||
      error?.message?.includes('429') ||
      error?.message?.includes('RESOURCE_EXHAUSTED');
    const userMessage = isOverloaded
      ? "Se ha agotado la cuota de IA disponible. Por favor, inténtalo de nuevo más tarde."
      : "No se pudo mejorar el texto. Inténtalo de nuevo.";
    return NextResponse.json(
      { error: userMessage },
      { status: isOverloaded ? 503 : 500 }
    );
  }
}
