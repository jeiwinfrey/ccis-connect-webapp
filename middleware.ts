import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "ccis_session";
const ROLE_COOKIE = "ccis_role";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(SESSION_COOKIE)?.value;
  const role = request.cookies.get(ROLE_COOKIE)?.value;

  // Allow API routes, static assets, and Next.js internals to pass through
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isAdminRoute = pathname.startsWith("/admin");
  const isLogin = pathname === "/";
  const isVirtualMap = pathname === "/virtual-map";
  const isReserve = pathname.startsWith("/reserve");
  const isUserRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/borrow") ||
    isReserve ||
    isVirtualMap;

  // ---- No session ----
  if (!session) {
    // Public routes: login page and virtual map
    if (isLogin || isVirtualMap) return NextResponse.next();
    // Everything else redirects to login
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // ---- Has session ----
  const isAdmin = role === "admin" || role === "super_admin";
  const isStudent = role === "student";

  // Logged-in user on login page -> redirect to appropriate home
  if (isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = isAdmin ? "/admin" : "/dashboard";
    return NextResponse.redirect(url);
  }

  // Admin accounts can only access /admin (and virtual-map as a public page)
  if (isAdmin && !isAdminRoute && !isVirtualMap) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  // Non-admin accounts cannot access /admin
  if (!isAdmin && isAdminRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Students cannot access /reserve (faculty-only)
  if (isStudent && isReserve) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
