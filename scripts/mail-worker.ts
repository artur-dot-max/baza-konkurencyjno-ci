import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
async function main() {
  const { deliverPendingMail } = await import("../src/lib/mail");
  const { prisma } = await import("../src/lib/prisma");
  let running = true;
  process.on("SIGINT", () => { running = false; });
  process.on("SIGTERM", () => { running = false; });
  do {
    try { await deliverPendingMail(); } catch { console.error("Mail worker: check SMTP configuration and database availability"); }
    if (process.argv.includes("--once")) break;
    await new Promise(resolve => setTimeout(resolve, 10000));
  } while (running);
  await prisma.$disconnect();
}
main().catch(() => { process.exitCode = 1; });
