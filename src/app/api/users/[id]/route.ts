import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { safeUserSelect } from "@/lib/access";
import { z } from "zod";
import { createAuditLog } from "@/lib/audit";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = z.union([z.object({ isActive: z.boolean() }), z.object({ status: z.enum(["ACTIVE", "BLOCKED"]) })]).safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    const isActive = "isActive" in parsed.data ? parsed.data.isActive : parsed.data.status === "ACTIVE";
    if (id === session.user.id && !isActive) return NextResponse.json({ error: "Nie możesz zablokować własnego konta" }, { status: 400 });

    const oldUser = await prisma.user.findUnique({ where: { id } });
    if (!oldUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isActive, sessionVersion: { increment: 1 } },
      select: safeUserSelect,
    });

    await createAuditLog({
      userId: session.user.id,
      action: "UPDATE",
      entity: "USER",
      entityId: id,
      details: JSON.stringify({ isActive: user.isActive }),
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
