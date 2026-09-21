import crypto from "node:crypto";

const sessions = new Set<string>();

export function createAdminSession(): string {
  const sessionId = crypto.randomUUID();
  sessions.add(sessionId);
  return sessionId;
}

export function hasAdminSession(sessionId: unknown): sessionId is string {
  return typeof sessionId === "string" && sessions.has(sessionId);
}

export function removeAdminSession(sessionId: unknown): void {
  if (typeof sessionId === "string") sessions.delete(sessionId);
}