import { NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { appUrl } from "@/lib/mail";
import { checkRateLimit, requestIp, getRateLimitHeaders } from "@/lib/rate-limit";
import { apiError } from "@/lib/api-error";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const rate = await checkRateLimit(`forgot:${requestIp(request)}`, 10, 3600000);
    if (!rate.success) return NextResponse.json({ error: "Spróbuj ponownie później" }, { status: 429, headers: getRateLimitHeaders(rate) });
    const parsed = z.object({ email: z.string().trim().email().max(254) }).safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Podaj poprawny adres e-mail" }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (user?.isActive) {
      const token = randomBytes(32).toString("hex");
      await prisma.$transaction(async tx => {
        await tx.passwordReset.create({ data: { tokenHash: createHash("sha256").update(token).digest("hex"), userId: user.id, expiresAt: new Date(Date.now() + 3600000) } });
        await tx.emailOutbox.create({ data: { to: user.email, subject: "Ustaw nowe hasło",
          text: `Aby ustawić nowe hasło, otwórz link ważny przez godzinę: ${appUrl(`/nowe-haslo#token=${token}`)}\nJeśli nie proszono o zmianę hasła, zignoruj tę wiadomość.` } });
      });
    }
    return NextResponse.json({ message: "Jeśli konto istnieje i jest aktywne, otrzymasz wiadomość z linkiem do zmiany hasła." });
  } catch (error) { return apiError(error); }
}
