import { NextResponse } from "next/server";
import { createHash } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-error";
import { checkRateLimit, requestIp } from "@/lib/rate-limit";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    if (!(await checkRateLimit(`reset:${requestIp(request)}`, 20, 3600000)).success) return NextResponse.json({ error: "Spróbuj później" }, { status: 429 });
    const parsed = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/),
      password: z.string().min(8).max(72).regex(/[A-Z]/).regex(/[0-9]/) }).safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Hasło: 8–72 znaki, wielka litera i cyfra. Link musi być poprawny." }, { status: 400 });
    const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
    const reset = await prisma.passwordReset.findUnique({ where: { tokenHash } });
    if (!reset || reset.expiresAt <= new Date()) return NextResponse.json({ error: "Link wygasł lub został wykorzystany" }, { status: 400 });
    const password = await bcrypt.hash(parsed.data.password, 12);
    const changed = await prisma.$transaction(async tx => {
      const consumed = await tx.passwordReset.deleteMany({ where: { id: reset.id, expiresAt: { gt: new Date() } } });
      if (!consumed.count) return false;
      await tx.user.update({ where: { id: reset.userId }, data: { password, sessionVersion: { increment: 1 } } });
      await tx.passwordReset.deleteMany({ where: { userId: reset.userId } });
      await tx.auditLog.create({ data: { userId: reset.userId, action: "PASSWORD_RESET", entity: "USER", entityId: reset.userId } });
      return true;
    });
    return changed ? NextResponse.json({ message: "Hasło zmienione. Zaloguj się ponownie." }) : NextResponse.json({ error: "Link został wykorzystany" }, { status: 400 });
  } catch (error) { return apiError(error); }
}
