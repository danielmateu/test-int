import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  
  // Lista de rutas que requieren autenticación
  const protectedRoutes = ['/builder'];
  
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !isLoggedIn) {
    // Redirigir al usuario a login si intenta acceder a /builder sin estar logueado
    const newUrl = new URL("/login", req.nextUrl.origin);
    // Podemos guardar la URL original a la que intentaba ir (callbackUrl)
    newUrl.searchParams.set("callbackUrl", req.nextUrl.href);
    return Response.redirect(newUrl);
  }
})

// Especificar en qué rutas debe ejecutarse el middleware
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
