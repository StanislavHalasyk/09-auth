// app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parse } from 'cookie';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

import { api } from '../../api';
import { ApiError } from '../../types';
import { logErrorResponse } from '../../_utils/utils';

export async function GET() {
  try {
    const cookieStore = await cookies();

    const accessToken = cookieStore.get('accessToken');
    const refreshToken = cookieStore.get('refreshToken');

    if (!accessToken && !refreshToken) {
      return NextResponse.json({ isAuthenticated: false }, { status: 200 });
    }

    const cookieHeaderParts: string[] = [];
    if (accessToken?.value) {
      cookieHeaderParts.push(`accessToken=${accessToken.value}`);
    }
    if (refreshToken?.value) {
      cookieHeaderParts.push(`refreshToken=${refreshToken.value}`);
    }
    const cookieHeader = cookieHeaderParts.join('; ');

    const { data, headers } = await api.get('/auth/session', {
      headers: {
        Cookie: cookieHeader,
      },
    });

    const resCookies = headers['set-cookie'];

    if (resCookies) {
      const cookiesArray = Array.isArray(resCookies) ? resCookies : [resCookies];

      for (const cookieItem of cookiesArray) {
        const parsedCookieItem = parse(cookieItem);

        const options: Partial<ResponseCookie> = {
          maxAge: parsedCookieItem['Max-Age'] ? Number(parsedCookieItem['Max-Age']) : undefined,
          path: parsedCookieItem.path,
          expires: parsedCookieItem.expires ? new Date(parsedCookieItem.expires) : undefined,
        };

        if (parsedCookieItem.accessToken) {
          cookieStore.set('accessToken', parsedCookieItem.accessToken, options);
        }
        if (parsedCookieItem.refreshToken) {
          cookieStore.set('refreshToken', parsedCookieItem.refreshToken, options);
        }
      }
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    logErrorResponse(error);

    const resErr = error as ApiError;
    const status = resErr.response?.status ?? 500;

    return NextResponse.json(
      {
        isAuthenticated: false,
        error: resErr.response?.data?.error ?? resErr.message,
      },
      { status },
    );
  }
}
