import { loadEnvConfig } from "@next/env";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
loadEnvConfig(process.cwd());
const db = new PrismaClient();
async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !password || password.length < 12 || password.length > 72) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD (12–72 characters)");
  await db.user.create({ data: { email, password: await bcrypt.hash(password, 12), name: "Administrator", role: "ADMIN" } });
  console.log("Administrator created");
}
main().catch(() => { console.error("Could not create administrator: check configuration or existing account"); process.exitCode = 1; }).finally(() => db.$disconnect());
