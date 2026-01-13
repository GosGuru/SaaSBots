import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

/**
 * Session management utilities for Next.js 16
 * 
 * This module handles stateless session management using JWTs.
 * The session is stored in an HTTP-only cookie and encrypted.
 * 
 * Note: For Supabase auth, we primarily rely on Supabase's own
 * session management. This module provides additional session
 * utilities if needed for custom data.
 */

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export interface SessionPayload {
  userId: string;
  tenantId?: string;
  role?: string;
  expiresAt: Date;
}

/**
 * Encrypt session data into a JWT
 */
export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

/**
 * Decrypt a JWT and return the session payload
 */
export async function decrypt(session: string | undefined = ""): Promise<SessionPayload | undefined> {
  if (!session) return undefined;
  
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch (error) {
    console.log("Failed to verify session:", error);
    return undefined;
  }
}

/**
 * Create a new session and store it in a cookie
 */
export async function createSession(userId: string, tenantId?: string, role?: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await encrypt({ userId, tenantId, role, expiresAt });
  
  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

/**
 * Update/refresh the session expiration
 */
export async function updateSession(): Promise<void> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  const payload = await decrypt(session);

  if (!session || !payload) {
    return;
  }

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires,
    sameSite: "lax",
    path: "/",
  });
}

/**
 * Delete the session cookie (logout)
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

/**
 * Get the current session payload without redirecting
 */
export async function getSession(): Promise<SessionPayload | undefined> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  return decrypt(session);
}
