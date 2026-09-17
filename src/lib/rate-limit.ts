import { createHash } from "crypto";
import { prisma } from "./prisma";
export interface RateLimitResult { success: boolean; remaining: number; reset: number; limit: number }
export async function checkRateLimit(identifier: string, max = 100, windowMs = 60000): Promise<RateLimitResult> {
  const now = Date.now(); const bucket = Math.floor(now / windowMs); const reset = (bucket + 1) * windowMs;
  const key = createHash("sha256").update(`${identifier}:${bucket}:${windowMs}`).digest("hex");
  const entry = await prisma.rateLimit.upsert({ where: { key },
    create: { key, count: 1, expiresAt: new Date(reset) }, update: { count: { increment: 1 } } });
  return { success: entry.count <= max, remaining: Math.max(0, max - entry.count), reset, limit: max };
}
export function requestIp(request: Request) {
  return process.env.TRUST_PROXY === "true" ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown" : "shared";
}
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return { "X-RateLimit-Limit": String(result.limit), "X-RateLimit-Remaining": String(result.remaining),
    "Retry-After": String(Math.max(1, Math.ceil((result.reset - Date.now()) / 1000))) };
}
