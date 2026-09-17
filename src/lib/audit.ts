import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

interface AuditLogInput {
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  userId?: string;
}

export async function createAuditLog(input: AuditLogInput): Promise<void> {
  try {
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    await prisma.auditLog.create({
      data: {
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        details: input.details,
        userId: input.userId,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Audit log failure should not break the main operation
  }
}
