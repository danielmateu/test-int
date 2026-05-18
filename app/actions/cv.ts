"use server";

import { auth } from "@/auth";
import { createClient } from "@supabase/supabase-js";
import { CVData } from "@/components/cv-builder/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseSecret = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseSecret);

export async function saveCV(data: CVData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autorizado");
  }

  // Comprobar si ya existe un CV para este usuario
  const { data: existing, error: findError } = await supabase
    .from("cv_documents")
    .select("id")
    .eq("user_id", session.user.id)
    .single();

  if (findError && findError.code !== "PGRST116") {
    throw new Error("Error comprobando documentos existentes");
  }

  if (existing) {
    // Actualizar
    const { error } = await supabase
      .from("cv_documents")
      .update({ 
        content: data, 
        updated_at: new Date().toISOString() 
      })
      .eq("id", existing.id);
      
    if (error) throw new Error(error.message);
  } else {
    // Insertar nuevo
    const { error } = await supabase
      .from("cv_documents")
      .insert({ 
        user_id: session.user.id, 
        content: data 
      });
      
    if (error) throw new Error(error.message);
  }

  return { success: true };
}

export async function loadCV() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { data, error } = await supabase
    .from("cv_documents")
    .select("content")
    .eq("user_id", session.user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error loading CV:", error);
    return null;
  }

  return data?.content as CVData | null;
}
