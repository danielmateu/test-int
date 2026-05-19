"use server";

import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/auth";

// Cloudinary se autoconfigura si existe la variable CLOUDINARY_URL en el entorno.
// Solo forzamos que use HTTPS.
cloudinary.config({
  secure: true
});

export async function uploadImage(base64Image: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autorizado para subir imágenes");
  }

  try {
    // Subir la imagen base64 a Cloudinary
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "cv_profiles",
      // Opcional: transformar la imagen para asegurar que es cuadrada y centrada en la cara
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" }
      ]
    });
    
    return { success: true, url: result.secure_url };
  } catch (error: any) {
    console.error("Cloudinary Upload Error:", error);
    throw new Error("Error al subir la imagen a Cloudinary");
  }
}
