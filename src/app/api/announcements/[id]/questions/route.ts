import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canReadAnnouncement, isPublicAnnouncement, ownsOrganization } from "@/lib/access";
import { apiError } from "@/lib/api-error";
import { checkRateLimit, requestIp, getRateLimitHeaders } from "@/lib/rate-limit";
import { z } from "zod";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; const session = await auth();
    const ann = await prisma.announcement.findUnique({ where: { id } });
    if (!ann || !canReadAnnouncement(session, ann)) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const owner = ownsOrganization(session, ann.organizationId);
    const questions = await prisma.question.findMany({ where: { announcementId: id, ...(!owner && { isPublic: true }) }, include: { answers: true }, orderBy: { createdAt: "desc" } });
    return NextResponse.json(owner ? questions : questions.map(({ authorEmail, authorName, ...q }) => q));
  } catch (error) { return apiError(error); }
}
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rate = await checkRateLimit(`question:${requestIp(request)}`, 10, 3600000);
    if (!rate.success) return NextResponse.json({ error: "Spróbuj później" }, { status: 429, headers: getRateLimitHeaders(rate) });
    const ann = await prisma.announcement.findUnique({ where: { id } });
    if (!ann || !isPublicAnnouncement(ann)) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!["PUBLISHED", "IN_PROGRESS"].includes(ann.status) || !ann.bidsDeadline || ann.bidsDeadline <= new Date()) return NextResponse.json({ error: "Termin zadawania pytań upłynął" }, { status: 409 });
    const parsed = z.object({ content: z.string().trim().min(10).max(10000), authorEmail: z.string().email().max(254), authorName: z.string().trim().max(200).optional() }).safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    const question = await prisma.question.create({ data: { ...parsed.data, announcementId: id } });
    return NextResponse.json({ id: question.id }, { status: 201 });
  } catch (error) { return apiError(error); }
}
