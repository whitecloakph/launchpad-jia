import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  const url = request.nextUrl.clone();

  if (pathname === "/" && host.includes("hellojia.ai")) {
    url.pathname = "/job-portal";
    return NextResponse.rewrite(url);
  }

  if (
    host.includes("hirejia.ai") &&
    (pathname.startsWith("/dashboard") || pathname.startsWith("/job-openings") || pathname.startsWith("/login"))
  ) {
    const newUrl = new URL(request.url);
    newUrl.hostname = "hellojia.ai";
    return NextResponse.redirect(newUrl);
  }

  if (host.startsWith("admin.hirejia.ai") && pathname === "/") {
    const url = request.nextUrl.clone();
    // Redirect to admin-portal
    url.pathname = `/admin-portal`;
    return NextResponse.rewrite(url);
  }
   // Redirect to hirejia.ai for recruiter portal
  if (!host.includes("hirejia") && !host.includes("localhost") && pathname.includes("old-dashboard")) {
    const newUrl = new URL(request.url);
    newUrl.hostname = `hirejia.ai`;
    return NextResponse.redirect(newUrl);
  }

  // Redirect to hellojia.ai for applicant portal
  if (!host.includes("hellojia") && !host.includes("localhost") && (pathname.includes("applicant") || pathname.includes("job-openings"))) {
    const newUrl = new URL(request.url);
    newUrl.hostname = `hellojia.ai`;
    return NextResponse.redirect(newUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/recruiter-dashboard/:path*',
    '/applicant/:path*',
    '/dashboard/:path*',
    '/job-openings/:path*',
    '/whitecloak/:path*',
    '/admin-portal/:path*',
    '/'
  ],
};