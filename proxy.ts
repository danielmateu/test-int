import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth;

  // Solo el dashboard requiere autenticación.
  // /builder es accesible sin cuenta (modo demo).
  const protectedRoutes = ['/dashboard'];

  const isProtectedRoute = protectedRoutes.some(route =>
    req.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !isLoggedIn) {
    const newUrl = new URL("/login", req.nextUrl.origin);
    newUrl.searchParams.set("callbackUrl", req.nextUrl.href);
    return Response.redirect(newUrl);
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
