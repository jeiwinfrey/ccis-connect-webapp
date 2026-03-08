import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "ccis_session";

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/borrow", "/reserve"];

// Routes that require admin role (checked via API, but we block at middleware level too)
const ADMIN_ROUTES = ["/admin"];

// Public routes — login page & virtual map
const PUBLIC_ROUTES = ["/", "/virtual-map"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(SESSION_COOKIE)?.value;

  // Allow API routes, static assets, and Next.js internals to pass through
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAdmin = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  // If no session and trying to access protected/admin routes, redirect to login
  if (!session && (isProtected || isAdmin)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // If has session and trying to access login page, redirect to dashboard
  // (Admin role check happens client-side after /api/auth/me call)
  if (session && pathname === "/") {
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
