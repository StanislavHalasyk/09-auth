// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parse } from 'cookie';
import { checkServerSession } from '@/lib/api/serverApi';
import type { RawAxiosResponseHeaders } from 'axios';

const publicRoutes = ['/sign-in', '/sign-up'];
const privateRoutes = ['/profile', '/notes'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const isPrivateRoute = privateRoutes.some((route) => pathname.startsWith(route));

  if (!accessToken) {
    if (refreshToken) {
      const res = await checkServerSession();
      const headers = res.headers as RawAxiosResponseHeaders & {
        'set-cookie'?: string | string[];
      };
      const setCookie = headers['set-cookie'];

      if (setCookie) {
        const cookieArray = Array.isArray(setCookie) ? setCookie : [setCookie];
        for (const cookieStr of cookieArray) {
          const parsed = parse(cookieStr);
          const options = {
            expires: parsed.Expires ? new Date(parsed.Expires) : undefined,
            path: parsed.Path,
            maxAge: parsed['Max-Age'] ? Number(parsed['Max-Age']) : undefined,
          };
          if (parsed.accessToken) cookieStore.set('accessToken', parsed.accessToken, options);
          if (parsed.refreshToken) cookieStore.set('refreshToken', parsed.refreshToken, options);
        }

        if (isPublicRoute) {
          return NextResponse.redirect(new URL('/', request.url), {
            headers: { Cookie: cookieStore.toString() },
          });
        }
        if (isPrivateRoute) {
          return NextResponse.next({ headers: { Cookie: cookieStore.toString() } });
        }
      }
    }

    if (isPublicRoute) return NextResponse.next();
    if (isPrivateRoute) return NextResponse.redirect(new URL('/sign-in', request.url));
    return NextResponse.next();
  }

  if (isPublicRoute) return NextResponse.redirect(new URL('/', request.url));
  if (isPrivateRoute) return NextResponse.next();

  return NextResponse.next();
}

export const config = {
  matcher: ['/sign-in', '/sign-up', '/profile/:path*', '/notes/:path*'],
};
