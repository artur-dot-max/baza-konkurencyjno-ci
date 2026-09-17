import { z } from "zod";
export const criterionSchema = z.object({ name: z.string().trim().min(1).max(200), weight: z.coerce.number().positive().max(100) });
export const criteriaSchema = z.array(criterionSchema).min(1).max(30).refine(items => Math.abs(items.reduce((n, c) => n + c.weight, 0) - 100) < 0.01, "Suma wag musi wynosić 100%");
export const announcementSchema = z.object({
  procedureNumber: z.string().trim().min(1).max(100), title: z.string().trim().min(1).max(500),
  orderType: z.enum(["SUPPLIES", "SERVICES", "CONSTRUCTION"]),
  voivodeship: z.string().trim().min(1).max(100), location: z.string().trim().min(1).max(200),
  executionTerm: z.string().trim().min(1).max(300), description: z.string().min(1).max(100000),
  conditions: z.string().max(100000).default(""), criteria: criteriaSchema,
  publishedAt: z.string().default(""), bidsDeadline: z.string().default(""),
  contactPerson: z.string().trim().max(200).default(""), contactEmail: z.union([z.string().email(), z.literal("")]).default(""),
  contactPhone: z.string().trim().max(30).default(""), submissionMethod: z.string().trim().max(10000).default(""),
  attachmentIds: z.array(z.string()).max(10).default([]), status: z.enum(["DRAFT", "PUBLISHED"]),
}).superRefine((data, ctx) => {
  const fail = (path: string, message: string) => ctx.addIssue({ code: "custom", path: [path], message });
  for (const field of ["publishedAt", "bidsDeadline"] as const) if (data[field] && !Number.isFinite(Date.parse(data[field]))) fail(field, "Nieprawidłowa data");
  if (data.status === "PUBLISHED") {
    if (data.title.length < 10) fail("title", "Tytuł musi mieć co najmniej 10 znaków");
    if (data.description.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().length < 50) fail("description", "Opis musi mieć co najmniej 50 znaków");
    if (!data.publishedAt || !data.bidsDeadline) fail("bidsDeadline", "Daty są wymagane");
    if (Date.parse(data.bidsDeadline) <= Date.parse(data.publishedAt) || Date.parse(data.bidsDeadline) <= Date.now()) fail("bidsDeadline", "Termin ofert musi być w przyszłości i po publikacji");
  }
});
