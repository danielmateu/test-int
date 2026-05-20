import { auth } from "@/auth";
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const handleI18nRouting = createIntlMiddleware(routing);

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;

  // We use a regex to match /dashboard, /es/dashboard, etc.
  const isProtectedRoute = /^\/([^\/]+\/)?dashboard/.test(req.nextUrl.pathname);

  if (isProtectedRoute && !isLoggedIn) {
    const newUrl = new URL("/login", req.nextUrl.origin);
    // Para que al volver mantenga el idioma, usamos el href actual
    newUrl.searchParams.set("callbackUrl", req.nextUrl.href);
    return Response.redirect(newUrl);
  }

  // Continue with i18n routing
  return handleI18nRouting(req);
});

export const config = {
  // Combine matchers: match i18n paths and ignore static files/api
  matcher: ['/', '/(es|en|fr|de|it|pt|ca)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
