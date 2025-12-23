import { NextResponse } from 'next/server';
import { api } from '../../api';
import { isAxiosError } from 'axios';
import { logErrorResponse } from '../../_utils/utils';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const apiRes = await api.post('auth/login', body);

    const headers = new Headers();
    const setCookie = apiRes.headers['set-cookie'];

    if (setCookie) {
      if (Array.isArray(setCookie)) {
        setCookie.forEach((cookie) => headers.append('set-cookie', cookie));
      } else {
        headers.append('set-cookie', setCookie);
      }
    }

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers,
    });
  } catch (error) {
    if (isAxiosError(error)) {
      logErrorResponse(error.response?.data);
      return NextResponse.json(
        { error: error.response?.data?.message ?? 'Login failed' },
        { status: error.response?.status ?? 500 },
      );
    }

    logErrorResponse({ message: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
