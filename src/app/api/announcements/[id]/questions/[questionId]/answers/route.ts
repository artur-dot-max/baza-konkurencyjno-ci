import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ownsOrganization } from "@/lib/access";
import { answerSchema } from "@/lib/validators";
import { apiError } from "@/lib/api-error";
export async function POST(request: Request, { params }: { params: Promise<{ id: string; questionId: string }> }) {
  try {
    const session = await auth(); if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id, questionId } = await params;
    const ann = await prisma.announcement.findUnique({ where: { id } });
    if (!ann) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!ownsOrganization(session, ann.organizationId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!["PUBLISHED", "IN_PROGRESS"].includes(ann.status)) return NextResponse.json({ error: "Postępowanie jest zamknięte" }, { status: 409 });
    const question = await prisma.question.findFirst({ where: { id: questionId, announcementId: id } });
    if (!question) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const parsed = answerSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    const answer = await prisma.$transaction(async tx => {
      const answer = await tx.answer.create({ data: { content: parsed.data.content, questionId } });
      await tx.announcementHistory.create({ data: { announcementId: id, userId: session.user.id, action: "ANSWER_QUESTION", details: "Udzielono odpowiedzi na pytanie" } });
      return answer;
    });
    return NextResponse.json(answer, { status: 201 });
  } catch (error) { return apiError(error); }
}
