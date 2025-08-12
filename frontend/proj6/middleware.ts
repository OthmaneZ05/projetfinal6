import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

  // Routes protégées
  const protectedRoutes = ["/profile", "/dashboard", "/publish"]
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // Routes d'authentification
  const authRoutes = ["/auth/login", "/auth/register"]
  const isAuthRoute = authRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // Si l'utilisateur est connecté et essaie d'accéder aux pages d'auth
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route protégée
  if (!token && isProtectedRoute) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/profile/:path*", "/dashboard/:path*", "/publish/:path*", "/auth/:path*"],
}
