import { randomBytes, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { createAdminSession, deleteAdminSession, isValidAdminSession } from './db';

const SESSION_COOKIE = 'admin_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function safeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error('ADMIN_PASSWORD is not configured in the environment');
  }
  return safeEquals(password, expected);
}

export async function createSessionToken(): Promise<{ token: string; expiresAt: string; maxAge: number }> {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  await createAdminSession(token, expiresAt);
  return { token, expiresAt, maxAge: SESSION_TTL_MS / 1000 };
}

export async function destroySessionToken(token: string): Promise<void> {
  await deleteAdminSession(token);
}

export const ADMIN_SESSION_COOKIE = SESSION_COOKIE;

/** For use in Server Components / Server Actions (reads cookies() from next/headers). */
export async function isAdminAuthenticated(): Promise<boolean> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return isValidAdminSession(token);
}

/** For use inside API route handlers. */
export async function requireAdmin(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return isValidAdminSession(token);
}
