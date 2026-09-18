import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { createAuditLog } from "@/lib/audit";
import { apiError } from "@/lib/api-error";
import { newsInputSchema, newsStatus, newsWriteData, publicNewsWhere } from "@/lib/news";
import type { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    if (searchParams.get("scope") === "admin") {
      const session = await auth();
      if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Brak uprawnień" }, { status: 401 });
      const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1);
      const limit = 20;
      const status = searchParams.get("status");
      const search = searchParams.get("search")?.trim();
      const now = new Date();
      const where: Prisma.NewsWhereInput = {
        ...(search && { title: { contains: search, mode: "insensitive" } }),
        ...(status === "DRAFT" && { isPublished: false }),
        ...(status === "PUBLISHED" && { isPublished: true, publishedAt: { lte: now } }),
        ...(status === "SCHEDULED" && { isPublished: true, publishedAt: { gt: now } }),
      };
      const [data, total] = await Promise.all([
        prisma.news.findMany({
          where,
          select: { id: true, title: true, isPublished: true, publishedAt: true, updatedAt: true },
          orderBy: { updatedAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.news.count({ where }),
      ]);
      return NextResponse.json({
        data: data.map((item) => ({ ...item, status: newsStatus(item) })),
        pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
      });
    }

    const news = await prisma.news.findMany({
      where: publicNewsWhere(),
      orderBy: { publishedAt: "desc" }
    });
    return NextResponse.json(news);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Brak uprawnień" }, { status: 401 });
    const parsed = newsInputSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Nieprawidłowe dane" }, { status: 400 });
    const item = await prisma.news.create({ data: newsWriteData(parsed.data) });
    await createAuditLog({
      userId: session.user.id,
      action: "CREATE",
      entity: "NEWS",
      entityId: item.id,
      details: JSON.stringify({ title: item.title, status: newsStatus(item) }),
    });
    return NextResponse.json({ ...item, status: newsStatus(item) }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
