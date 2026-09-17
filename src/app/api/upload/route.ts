import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { MAX_FILE_SIZE } from "@/lib/utils";
import { createUploadToken, verifyUploadToken } from "@/lib/upload-token";

const allowedFiles: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/zip": [".zip"],
};

const uploadDirectory = path.resolve(process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads"));

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!(await checkRateLimit(`upload:${session.user.id}`, 30, 3600000)).success) return NextResponse.json({ error: "Limit przesyłania plików" }, { status: 429 });
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Nie wybrano pliku" }, { status: 400 });
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "Plik przekracza limit 10 MB" }, { status: 400 });

    const extension = path.extname(file.name).toLowerCase();
    if (!allowedFiles[file.type]?.includes(extension)) {
      return NextResponse.json({ error: "Niedozwolony typ pliku" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!(extension === ".pdf" ? buffer.subarray(0, 5).toString() === "%PDF-" : buffer[0] === 0x50 && buffer[1] === 0x4b)) return NextResponse.json({ error: "Zawartość nie odpowiada typowi pliku" }, { status: 400 });
    const fileName = `${randomUUID()}${extension}`;
    const filePath = `/api/uploads/${fileName}`;
    await mkdir(uploadDirectory, { recursive: true });
    await writeFile(path.join(uploadDirectory, fileName), buffer, { flag: "wx" });

    const uploadedFile = {
      fileName,
      originalName: path.basename(file.name),
      mimeType: file.type,
      fileSize: file.size,
      filePath,
    };
    const id = createUploadToken({
      userId: session.user.id,
      ...uploadedFile,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    return NextResponse.json({ file: { id, ...uploadedFile } }, { status: 201 });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Nie udało się zapisać pliku" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await request.json();
    const upload = typeof id === "string" ? verifyUploadToken(id, session.user.id) : null;
    if (!upload) return NextResponse.json({ error: "Nieprawidłowy identyfikator pliku" }, { status: 400 });

    if (await prisma.attachment.count({ where: { fileName: upload.fileName } })) return NextResponse.json({ error: "Plik jest przypisany do ogłoszenia" }, { status: 409 });
    const absolutePath = path.resolve(uploadDirectory, upload.fileName);
    if (!absolutePath.startsWith(`${uploadDirectory}${path.sep}`)) {
      return NextResponse.json({ error: "Nieprawidłowa ścieżka pliku" }, { status: 400 });
    }
    await unlink(absolutePath).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") throw error;
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Removing upload failed:", error);
    return NextResponse.json({ error: "Nie udało się usunąć pliku" }, { status: 500 });
  }
}
