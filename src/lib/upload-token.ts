import { createHmac, timingSafeEqual } from "crypto";

export interface UploadTokenPayload {
  userId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  expiresAt: number;
}

function getSecret(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is required for upload tokens");
  return secret;
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export function createUploadToken(payload: UploadTokenPayload): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifyUploadToken(token: string, userId: string): UploadTokenPayload | null {
  const [encoded, signature, extra] = token.split(".");
  if (!encoded || !signature || extra) return null;

  const expected = sign(encoded);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as UploadTokenPayload;
    if (payload.userId !== userId || payload.expiresAt < Date.now()) return null;
    if (!payload.filePath.startsWith("/api/uploads/") || payload.fileName.includes("/") || payload.fileName.includes("\\")) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
