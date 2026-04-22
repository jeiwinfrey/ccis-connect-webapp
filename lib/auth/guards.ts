import type { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { errorResponse, forbiddenResponse, unauthorizedResponse } from "@/lib/api/response";
import { db, users } from "@/lib/db";
import type { SafeUser, User } from "@/lib/db/types";
import { getSessionUserId } from "@/lib/auth/session";

type AuthSuccess = {
  ok: true;
  user: SafeUser;
};

type AuthFailure = {
  ok: false;
  response: NextResponse;
};

export type AuthResult = AuthSuccess | AuthFailure;

export function isAdminRole(role: string): boolean {
  return role === "admin" || role === "super_admin";
}

export function toSafeUser(user: User): SafeUser {
  const { passwordHash, ...safeUser } = user;
  void passwordHash;
  return safeUser;
}

export async function requireUser(): Promise<AuthResult> {
  const userId = await getSessionUserId();

  if (!userId) {
    return { ok: false, response: unauthorizedResponse("Not authenticated") };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return { ok: false, response: unauthorizedResponse("Session expired") };
  }

  return { ok: true, user: toSafeUser(user) };
}

export async function requireAdmin(): Promise<AuthResult> {
  const auth = await requireUser();

  if (!auth.ok) {
    return auth;
  }

  if (!isAdminRole(auth.user.role)) {
    return { ok: false, response: forbiddenResponse("Admin access required") };
  }

  return auth;
}

export async function requireSelfOrAdmin(targetUserId: string): Promise<AuthResult> {
  const auth = await requireUser();

  if (!auth.ok) {
    return auth;
  }

  if (auth.user.id !== targetUserId && !isAdminRole(auth.user.role)) {
    return { ok: false, response: forbiddenResponse("You can only access your own records") };
  }

  return auth;
}

export function internalAuthError(): NextResponse {
  return errorResponse("Internal server error");
}
