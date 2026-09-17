import { pagination, safeUserSelect } from "@/lib/access";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = pagination(request.url);

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        select: safeUserSelect,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count(),
    ]);

    return NextResponse.json({
      data: data.map((user) => ({ ...user, status: user.isActive ? "ACTIVE" : "BLOCKED" })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
