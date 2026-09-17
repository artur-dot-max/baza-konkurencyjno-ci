import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export function apiError(error: unknown) {
  if (error instanceof SyntaxError) return NextResponse.json({ error: "Nieprawidłowy format danych" }, { status: 400 });
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return NextResponse.json({ error: "Rekord o tych danych już istnieje" }, { status: 409 });
    if (error.code === "P2025") return NextResponse.json({ error: "Rekord został zmieniony lub nie istnieje. Odśwież stronę." }, { status: 409 });
  }
  console.error("API operation failed", error instanceof Error ? error.name : "unknown");
  return NextResponse.json({ error: "Nie udało się wykonać operacji" }, { status: 500 });
}
