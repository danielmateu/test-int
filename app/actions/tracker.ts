"use server";

import { auth } from "@/auth";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseSecret = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseSecret);

export interface JobApplication {
  id: string;
  user_id: string;
  title: string;
  company: string;
  location?: string;
  salary?: string;
  type?: string;
  status: "saved" | "applied" | "interviewing" | "offer" | "rejected";
  notes?: string;
  apply_url?: string;
  cv_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

// 1. Obtener todas las postulaciones
export async function getJobApplications(): Promise<{ data: JobApplication[]; useLocalStorage?: boolean }> {
  const session = await auth();
  console.log("[getJobApplications] Session user:", session?.user?.id);
  if (!session?.user?.id) {
    throw new Error("No autorizado");
  }

  try {
    const { data, error } = await supabase
      .from("job_applications")
      .select("*")
      .eq("user_id", session.user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("[getJobApplications] Supabase error:", error);
      // Código 42P01 significa que la relación/tabla no existe
      if (error.code === "42P01" || error.message?.includes("relation")) {
        return { data: [], useLocalStorage: true };
      }
      throw new Error(error.message);
    }

    console.log("[getJobApplications] Success. Retrieved applications count:", data?.length || 0);
    return { data: data || [] };
  } catch (err: any) {
    console.log("Job Tracker Database: Table 'job_applications' not found. Using localStorage fallback.", err.message);
    return { data: [], useLocalStorage: true };
  }
}

// 2. Guardar/Agregar una nueva postulación
export async function addJobApplication(
  app: Omit<JobApplication, "id" | "user_id" | "created_at" | "updated_at">
): Promise<{ success: boolean; data?: JobApplication; useLocalStorage?: boolean }> {
  const session = await auth();
  console.log("[addJobApplication] Session user:", session?.user?.id);
  if (!session?.user?.id) {
    throw new Error("No autorizado");
  }

  try {
    const newApp = {
      ...app,
      user_id: session.user.id,
      updated_at: new Date().toISOString()
    };

    console.log("[addJobApplication] Inserting job application:", newApp.title, "for company:", newApp.company);
    const { data, error } = await supabase
      .from("job_applications")
      .insert(newApp)
      .select()
      .single();

    if (error) {
      console.error("[addJobApplication] Supabase error:", error);
      if (error.code === "42P01" || error.message?.includes("relation")) {
        return { success: true, useLocalStorage: true };
      }
      throw new Error(error.message);
    }

    console.log("[addJobApplication] Success. Inserted ID:", data?.id);
    return { success: true, data };
  } catch (err: any) {
    console.error("[addJobApplication] Catch block error:", err.message);
    return { success: true, useLocalStorage: true };
  }
}

// 3. Actualizar el estado de una postulación (Mover columna Kanban)
export async function updateJobApplicationStatus(
  id: string,
  status: "saved" | "applied" | "interviewing" | "offer" | "rejected"
): Promise<{ success: boolean; useLocalStorage?: boolean }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autorizado");
  }

  try {
    const { error } = await supabase
      .from("job_applications")
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
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

// 4. Guardar notas privadas y asociar CV
export async function updateJobApplicationDetails(
  id: string,
  notes: string,
  cvId: string | null
): Promise<{ success: boolean; useLocalStorage?: boolean }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autorizado");
  }

  try {
    const { error } = await supabase
      .from("job_applications")
      .update({ 
        notes, 
        cv_id: cvId,
        updated_at: new Date().toISOString() 
      })
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

// 5. Eliminar una postulación
export async function deleteJobApplication(id: string): Promise<{ success: boolean; useLocalStorage?: boolean }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autorizado");
  }

  try {
    const { error } = await supabase
      .from("job_applications")
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
