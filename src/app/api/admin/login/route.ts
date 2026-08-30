import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, verifyAdminPassword, ADMIN_SESSION_COOKIE } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    let valid: boolean;
    try {
      valid = verifyAdminPassword(password);
    } catch {
      return NextResponse.json(
        { error: 'Admin login is not configured. Set ADMIN_PASSWORD in .env.local' },
        { status: 500 }
      );
    }

    if (!valid) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    const { token, maxAge } = await createSessionToken();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge,
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
