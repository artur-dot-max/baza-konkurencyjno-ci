import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const nextAuth = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Hasło", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        if (!(await checkRateLimit(`login:${email.toLowerCase()}`, 10, 900000)).success) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { organization: true },
        });

        if (!user || !user.password) return null;
        if (!user.isActive) return null;

        // Check if organization is active (for ORGANIZATION users)
        if (user.role === "ORGANIZATION" && user.organization?.status !== "ACTIVE") return null;

        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId || undefined,
          sessionVersion: user.sessionVersion,
        };
      },
    }),
  ],
});

export const { handlers, signIn, signOut } = nextAuth;

// Recheck database state on every server access; a JWT alone may outlive a block or password reset.
export async function auth() {
  const session = await nextAuth.auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { organization: true } });
  if (!user?.isActive || (user.role === "ORGANIZATION" && user.organization?.status !== "ACTIVE")) return null;
  if (user.sessionVersion !== session.user.sessionVersion) return null;
  session.user.role = user.role;
  session.user.organizationId = user.organizationId ?? undefined;
  return session;
}
