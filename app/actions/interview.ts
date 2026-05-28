"use server";

import { auth } from "@/auth";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseSecret = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseSecret);

export interface InterviewSimulationRecord {
  id: string;
  user_id: string;
  cv_id: string | null;
  job_title: string;
  company: string;
  job_description?: string;
  score: number;
  overall_feedback: string;
  qa_data: { question: string; answer: string }[];
  analysis_data: any[];
  created_at?: string;
  updated_at?: string;
}

// 1. Guardar una nueva simulación de entrevista
export async function saveInterviewSimulationAction(
  cvId: string | null,
  jobTitle: string,
  company: string,
  jobDescription: string,
  score: number,
  overallFeedback: string,
  qaData: { question: string; answer: string }[],
  analysisData: any[]
): Promise<{ success: boolean; data?: InterviewSimulationRecord; useLocalStorage?: boolean }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autorizado");
  }

  try {
    const newRecord = {
      user_id: session.user.id,
      cv_id: cvId || null,
      job_title: jobTitle,
      company: company,
      job_description: jobDescription,
      score,
      overall_feedback: overallFeedback,
      qa_data: qaData,
      analysis_data: analysisData,
      updated_at: new Date().toISOString()
    };

    console.log("[saveInterviewSimulationAction] Saving simulation for company:", company, "Score:", score);
    const { data, error } = await supabase
      .from("interview_simulations")
      .insert(newRecord)
      .select()
      .single();

    if (error) {
      console.error("[saveInterviewSimulationAction] Supabase error:", error);
      // PGRST116 o código de relación faltante (42P01)
      if (error.code === "42P01" || error.message?.includes("relation")) {
        return { success: true, useLocalStorage: true };
      }
      throw new Error(error.message);
    }

    return { success: true, data };
  } catch (err: any) {
    console.warn("Interview Database: Table 'interview_simulations' not found or failed. Using localStorage fallback.", err.message);
    return { success: true, useLocalStorage: true };
  }
}

// 2. Obtener historial de simulaciones del usuario
export async function getInterviewSimulationsAction(): Promise<{ data: InterviewSimulationRecord[]; useLocalStorage?: boolean }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autorizado");
  }

  try {
    const { data, error } = await supabase
      .from("interview_simulations")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getInterviewSimulationsAction] Supabase error:", error);
      if (error.code === "42P01" || error.message?.includes("relation")) {
        return { data: [], useLocalStorage: true };
      }
      throw new Error(error.message);
    }

    return { data: data || [] };
  } catch (err: any) {
    console.log("Interview Database: Table 'interview_simulations' not found. Using localStorage fallback.", err.message);
    return { data: [], useLocalStorage: true };
  }
}

// 3. Eliminar una simulación del historial
export async function deleteInterviewSimulationAction(id: string): Promise<{ success: boolean; useLocalStorage?: boolean }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autorizado");
  }

  try {
    const { error } = await supabase
      .from("interview_simulations")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (error) {
      if (error.code === "42P01" || error.message?.includes("relation")) {
        return { success: true, useLocalStorage: true };
      }
      throw new Error(error.message);
    }

    return { success: true };
  } catch (err: any) {
    return { success: true, useLocalStorage: true };
  }
}
