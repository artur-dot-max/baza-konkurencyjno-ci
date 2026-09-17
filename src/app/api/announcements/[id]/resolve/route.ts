import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ownsOrganization } from "@/lib/access";
import { apiError } from "@/lib/api-error";
import { procurementResultSchema, cancellationSchema } from "@/lib/validators";
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth(); if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const ann = await prisma.announcement.findUnique({ where: { id } });
    if (!ann) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!ownsOrganization(session, ann.organizationId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!["PUBLISHED", "IN_PROGRESS"].includes(ann.status)) return NextResponse.json({ error: "Postępowanie nie jest otwarte" }, { status: 409 });
    const body = await request.json(); const type = String(body.type ?? body.action ?? "").toLowerCase();
    if (!["resolve", "cancel"].includes(type)) return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    if (type === "resolve" && (!ann.bidsDeadline || ann.bidsDeadline > new Date())) return NextResponse.json({ error: "Termin składania ofert jeszcze nie upłynął" }, { status: 409 });
    const result = procurementResultSchema.safeParse({ ...body, price: Number(body.price) });
    const cancellation = cancellationSchema.safeParse(body);
    if (type === "resolve" && !result.success) return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    if (type === "cancel" && !cancellation.success) return NextResponse.json({ error: cancellation.error.issues[0].message }, { status: 400 });
    const updated = await prisma.$transaction(async tx => {
      const updated = await tx.announcement.update({ where: { id, status: ann.status, updatedAt: ann.updatedAt }, data: {
        status: type === "resolve" ? "RESOLVED" : "CANCELLED",
        ...(type === "cancel" && cancellation.success && { cancellationReason: cancellation.data.cancellationReason }),
        ...(type === "resolve" && result.success && { result: { create: result.data } }),
        history: { create: { userId: session.user.id, action: type.toUpperCase(), details: type === "resolve" ? "Rozstrzygnięto postępowanie" : "Unieważniono postępowanie" } },
      } });
      await tx.auditLog.create({ data: { userId: session.user.id, entity: "ANNOUNCEMENT", entityId: id, action: type.toUpperCase() } });
      return updated;
    });
    return NextResponse.json(updated);
  } catch (error) { return apiError(error); }
}
