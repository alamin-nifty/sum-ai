import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Define which paths are protected
  const protectedPaths = ["/dashboard"];
  const isProtectedPath = protectedPaths.some(
    (protectedPath) =>
      path === protectedPath || path.startsWith(`${protectedPath}/`)
  );

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  const token = await getToken({ req });

  // Redirect to login if no token and trying to access a protected path
  if (!token && isProtectedPath) {
    const url = new URL("/auth/signin", req.url);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /auth/signin (login page)
     * 4. /images, /fonts, /favicon.ico, etc.
     */
    "/((?!api|_next|auth/signin|images|fonts|favicon.ico).*)",
  ],
};
