import type { Announcement, Prisma } from "@prisma/client";
import type { Session } from "next-auth";

export const safeUserSelect = {
  id: true, email: true, name: true, role: true, isActive: true,
  organizationId: true, createdAt: true, updatedAt: true,
} satisfies Prisma.UserSelect;

export const publicAnnouncementWhere = (): Prisma.AnnouncementWhereInput => ({
  status: { not: "DRAFT" }, publishedAt: { lte: new Date() },
});

export function ownsOrganization(session: Session | null, organizationId: string) {
  return !!session?.user?.id && (session.user.role === "ADMIN" ||
    (session.user.role === "ORGANIZATION" && session.user.organizationId === organizationId));
}

export function isPublicAnnouncement(ann: Pick<Announcement, "status" | "publishedAt">) {
  return ann.status !== "DRAFT" && !!ann.publishedAt && ann.publishedAt <= new Date();
}

export function canReadAnnouncement(session: Session | null, ann: Pick<Announcement, "status" | "publishedAt" | "organizationId">) {
  return isPublicAnnouncement(ann) || ownsOrganization(session, ann.organizationId);
}

export function pagination(url: string) {
  const params = new URL(url).searchParams;
  const integer = (value: string | null, fallback: number, max: number) => {
    const n = Number(value);
    return Number.isSafeInteger(n) && n > 0 ? Math.min(n, max) : fallback;
  };
  const page = integer(params.get("page"), 1, 100000);
  const limit = integer(params.get("limit"), 10, 100);
  return { page, limit, skip: (page - 1) * limit };
}
