import { auth } from "@/auth";
import { canReadAnnouncement } from "@/lib/access";
import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

const uploadDirectory = path.resolve(process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads"));

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileName: string }> }
) {
  const { fileName } = await params;
  if (path.basename(fileName) !== fileName) {
    return NextResponse.json({ error: "Nieprawidłowa nazwa pliku" }, { status: 400 });
  }

  const attachment = await prisma.attachment.findFirst({ where: { fileName }, include: { announcement: true } });
  if (!attachment) return NextResponse.json({ error: "Nie znaleziono pliku" }, { status: 404 });

  if (!canReadAnnouncement(await auth(), attachment.announcement)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const contents = await readFile(path.join(uploadDirectory, fileName));
    const safeName = attachment.originalName.replace(/["\r\n]/g, "_");
    return new NextResponse(contents, {
      headers: {
        "Content-Type": attachment.mimeType,
        "Content-Length": String(contents.length),
        "Content-Disposition": `attachment; filename="download"; filename*=UTF-8''${encodeURIComponent(safeName)}`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Nie znaleziono pliku" }, { status: 404 });
  }
}
