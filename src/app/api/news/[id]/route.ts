import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-error";
import { createAuditLog } from "@/lib/audit";
import { newsInputSchema, newsStatus, newsWriteData } from "@/lib/news";

type Context = { params: Promise<{ id: string }> };

async function adminSession() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}

export async function GET(_request: Request, { params }: Context) {
  try {
    if (!await adminSession()) return NextResponse.json({ error: "Brak uprawnień" }, { status: 401 });
    const { id } = await params;
    const item = await prisma.news.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ error: "Aktualność nie istnieje" }, { status: 404 });
    return NextResponse.json({ ...item, status: newsStatus(item) });
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request: Request, { params }: Context) {
  try {
    const session = await adminSession();
    if (!session) return NextResponse.json({ error: "Brak uprawnień" }, { status: 401 });
    const { id } = await params;
    const current = await prisma.news.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ error: "Aktualność nie istnieje" }, { status: 404 });
    const parsed = newsInputSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Nieprawidłowe dane" }, { status: 400 });
    const item = await prisma.news.update({ where: { id }, data: newsWriteData(parsed.data, current) });
    await createAuditLog({
      userId: session.user.id,
      action: "UPDATE",
      entity: "NEWS",
      entityId: item.id,
      details: JSON.stringify({ title: item.title, from: newsStatus(current), to: newsStatus(item) }),
    });
    return NextResponse.json({ ...item, status: newsStatus(item) });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const session = await adminSession();
    if (!session) return NextResponse.json({ error: "Brak uprawnień" }, { status: 401 });
    const { id } = await params;
    const item = await prisma.news.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ error: "Aktualność nie istnieje" }, { status: 404 });
    await prisma.news.delete({ where: { id } });
    await createAuditLog({
      userId: session.user.id,
      action: "DELETE",
      entity: "NEWS",
      entityId: id,
      details: JSON.stringify({ title: item.title }),
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}
