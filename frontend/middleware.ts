import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES: { prefix: string; roles: string[] }[] = [
  { prefix: '/admin', roles: ['admin'] },
  { prefix: '/psicologo', roles: ['psicologo', 'admin'] },
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rule = PROTECTED_PREFIXES.find((r) => pathname.startsWith(r.prefix));

  if (!rule) {
    return NextResponse.next();
  }

  const demoRole = request.cookies.get('demo_role')?.value;
  if (!demoRole || !rule.roles.includes(demoRole)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/auth';
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/psicologo/:path*'],
};
