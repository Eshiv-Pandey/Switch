import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Next.js 16: proxy.ts replaces middleware.ts
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isAuthRoute = nextUrl.pathname.startsWith("/sign-in");
  const isProtectedRoute =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/chat") ||
    nextUrl.pathname.startsWith("/projects") ||
    nextUrl.pathname.startsWith("/memory") ||
    nextUrl.pathname.startsWith("/files") ||
    nextUrl.pathname.startsWith("/settings");

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/sign-in", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
