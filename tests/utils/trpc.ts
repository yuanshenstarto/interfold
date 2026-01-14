/**
 * Test utilities for tRPC contract tests
 * Provides helpers for creating authenticated contexts
 */

import type { Session, User } from "better-auth/types";
import { db } from "~/server/db";

/**
 * Create a mock authenticated context for testing
 * Bypasses Better Auth and provides a fake session
 */
export function createMockTRPCContext(opts?: {
  userId?: string;
  userName?: string;
  userEmail?: string;
}) {
  const userId = opts?.userId ?? `test-user-${Date.now()}`;
  const userName = opts?.userName ?? "Test User";
  const userEmail = opts?.userEmail ?? `test-${Date.now()}@example.com`;

  const mockUser: User = {
    id: userId,
    name: userName,
    email: userEmail,
    emailVerified: false,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSession: Session = {
    id: `test-session-${Date.now()}`,
    userId: userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
    token: `test-token-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    ipAddress: null,
    userAgent: null,
  };

  return {
    db,
    session: {
      user: mockUser,
      session: mockSession,
    },
    headers: new Headers(),
  };
}

/**
 * Create an unauthenticated context (no session)
 */
export function createUnauthenticatedTRPCContext() {
  return {
    db,
    session: null,
    headers: new Headers(),
  };
}
