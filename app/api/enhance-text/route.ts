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
      default:
        systemPrompt += "Mejora profesionalmente el siguiente texto para un currículum vitae. Devuelve ÚNICAMENTE el texto mejorado, sin introducciones.";
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text }] }
      ],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    const enhancedText = response.text?.trim() || text;

    return NextResponse.json({ text: enhancedText });
  } catch (error: any) {
    console.error("AI Enhance Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to enhance text" },
      { status: 500 }
    );
  }
}
