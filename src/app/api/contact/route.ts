import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, requestIp } from "@/lib/rate-limit";
import { apiError } from "@/lib/api-error";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    if (!(await checkRateLimit(`contact:${requestIp(request)}`, 5, 3600000)).success) return NextResponse.json({ error: "Spróbuj później" }, { status: 429 });
    const parsed = z.object({ name: z.string().trim().min(2).max(200), email: z.string().email().max(254),
      subject: z.string().trim().min(3).max(200), message: z.string().trim().min(10).max(10000) }).safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Uzupełnij poprawnie formularz (wiadomość: minimum 10 znaków)." }, { status: 400 });
    if (!process.env.CONTACT_EMAIL) return NextResponse.json({ error: "Formularz kontaktowy jest chwilowo niedostępny." }, { status: 503 });
    const data = parsed.data;
    await prisma.emailOutbox.create({ data: { to: process.env.CONTACT_EMAIL, replyTo: data.email,
      subject: `Kontakt: ${data.subject}`, text: `${data.name} <${data.email}>\n\n${data.message}` } });
    return NextResponse.json({ message: "Wiadomość przyjęta do wysłania." }, { status: 202 });
  } catch (error) { return apiError(error); }
}
