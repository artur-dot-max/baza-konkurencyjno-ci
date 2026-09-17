import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publicNewsWhere } from "@/lib/news";

export async function GET(request: Request) {
  try {
    const news = await prisma.news.findMany({
      where: publicNewsWhere(),
      orderBy: { publishedAt: "desc" }
    });
    return NextResponse.json(news);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
