"use server";

import { auth } from "@/auth";
import { createClient } from "@supabase/supabase-js";
import { CVData } from "@/components/cv-builder/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseSecret = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseSecret);

export async function getCVs() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const { data, error } = await supabase
    .from("cv_documents")
    .select("id, updated_at, content->title")
    .eq("user_id", session.user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error loading CVs:", error);
    return [];
  }

  return data.map((doc: any) => ({
    id: doc.id,
    updated_at: doc.updated_at,
    title: doc.title || "CV Sin Título",
  }));
}

export async function saveCV(data: CVData, id?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autorizado");
  }

  // Si hay ID, intentamos actualizar ese documento específico
  if (id) {
    const { error: updateError } = await supabase
      .from("cv_documents")
      .update({ 
        content: data, 
        updated_at: new Date().toISOString() 
      })
      .eq("id", id)
      .eq("user_id", session.user.id);
      
    if (updateError) throw new Error(updateError.message);
    return { success: true, id };
  } 
  
  // Si no hay ID, es una creación nueva. Comprobamos el límite.
  const { count, error: countError } = await supabase
    .from("cv_documents")
    .select("*", { count: 'exact', head: true })
    .eq("user_id", session.user.id);

  if (countError) throw new Error("Error comprobando el límite de CVs");

  if (count && count >= 4) {
    throw new Error("Has alcanzado el límite de 4 currículums gratuitos.");
  }

  // Insertar nuevo
  const { data: insertedData, error: insertError } = await supabase
    .from("cv_documents")
    .insert({ 
      user_id: session.user.id, 
      content: data 
    })
    .select("id")
    .single();
    
  if (insertError) throw new Error(insertError.message);

  return { success: true, id: insertedData.id };
}

export async function loadCV(id?: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  let query = supabase
    .from("cv_documents")
    .select("id, content")
    .eq("user_id", session.user.id);

  if (id) {
    query = query.eq("id", id);
  } else {
    // Para retrocompatibilidad si alguien entra sin ID, cargamos el más reciente
    query = query.order("updated_at", { ascending: false }).limit(1);
  }

  const { data, error } = await query.single();

  if (error && error.code !== "PGRST116") {
    console.error("Error loading CV:", error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    content: data.content as CVData,
  };
}

export async function deleteCV(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  const { error } = await supabase
    .from("cv_documents")
    .delete()
    .eq("id", id)
    .eq("user_id", session.user.id);

  if (error) throw new Error(error.message);
  return { success: true };
}
