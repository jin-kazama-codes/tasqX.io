import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { cookies } from "next/headers";

export function middleware(request: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get("user")?.value;

  const publicPaths = [
    "/login",
    "/forgot-password",
    "/reset-password",
    "/images/tasqx-logo.svg",
    "/images/tasqx-logo.png",
    "/images/karya-io-logo.png",
  ];

  const url = request.nextUrl.clone();
  if (!token && !publicPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const projectKeyPattern =
    /^\/([^/]+)\/(backlog|report(?:\/[^/]+)?|users|issue(?:\/[^/]+)?|roadmap|board|settings|document)/;
  const matchResult = url.pathname.match(projectKeyPattern);

  if (matchResult) {
    const [, projectKey, route] = matchResult;
    url.pathname = `/${route}`;
    url.searchParams.set("projectKey", projectKey);
    
    const response = NextResponse.rewrite(url);
    response.headers.set('x-original-pathname', request.nextUrl.pathname);
    response.headers.set('x-invoke-path', url.pathname);
    return response;
}

const response = NextResponse.next();
response.headers.set('x-original-pathname', request.nextUrl.pathname);
response.headers.set('x-invoke-path', request.nextUrl.pathname);
return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};