import { auth } from "@/auth";
import { redirect } from "@/i18n/routing";

// Lista de correos autorizados por defecto
export const DEFAULT_ADMIN_EMAILS = [
  "danielmateu86@gmail.com",
  "rapitecnicbcn@gmail.com",
  "admin@example.com"
];

/**
 * Verifica si un email corresponde a un administrador
 */
export function isAdmin(email?: string | null): boolean {
  if (!email) return false;
  
  const envEmails = process.env.ADMIN_EMAILS 
    ? process.env.ADMIN_EMAILS.split(",").map(e => e.trim().toLowerCase()) 
    : [];

  const lowerEmail = email.toLowerCase();
  
  return envEmails.includes(lowerEmail) || DEFAULT_ADMIN_EMAILS.includes(lowerEmail);
}

/**
 * Función helper para páginas de servidor Next.js que redirige si el usuario no es admin.
 */
export async function checkAdminOrRedirect(locale: string) {
  const session = await auth();
  
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    redirect({ href: "/dashboard", locale });
  }
  
  return session;
}
