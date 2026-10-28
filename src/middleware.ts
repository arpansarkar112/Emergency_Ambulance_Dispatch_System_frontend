import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

function getRoleHomePath(role?: string): string {
  if (role === "ADMIN") return "/admin";
  if (role === "DRIVER") return "/provider";
  return "/dashboard";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAdminRoute = pathname.startsWith("/admin");
  const isProviderRoute = pathname.startsWith("/provider");
  const isUserRoute = pathname.startsWith("/dashboard");
  const isProtectedRoute = isAdminRoute || isProviderRoute || isUserRoute;

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token) {
    const role = (token.role as string) || "PATIENT";

    if (isAdminRoute && role !== "ADMIN") {
      return NextResponse.redirect(new URL(getRoleHomePath(role), request.url));
    }

    if (isProviderRoute && role !== "DRIVER") {
      return NextResponse.redirect(new URL(getRoleHomePath(role), request.url));
    }

    if (isUserRoute && role !== "PATIENT") {
      return NextResponse.redirect(new URL(getRoleHomePath(role), request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/provider/:path*", "/dashboard/:path*"],
};
