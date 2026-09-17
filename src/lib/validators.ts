import { z } from "zod";

// ============================================
// Walidacja rejestracji organizacji
// ============================================
export const registerOrganizationSchema = z.object({
  organizationName: z
    .string()
    .min(3, "Nazwa organizacji musi mieć co najmniej 3 znaki")
    .max(200, "Nazwa organizacji może mieć maksymalnie 200 znaków"),
  nip: z
    .string()
    .regex(/^\d{10}$/, "NIP musi składać się z 10 cyfr"),
  regon: z
    .string()
    .regex(/^\d{9}(\d{5})?$/, "REGON musi składać się z 9 lub 14 cyfr"),
  krs: z
    .string()
    .regex(/^\d{10}$/, "KRS musi składać się z 10 cyfr")
    .optional()
    .or(z.literal("")),
  address: z.string().min(5, "Adres jest wymagany"),
  city: z.string().min(2, "Miasto jest wymagane"),
  postalCode: z
    .string()
    .regex(/^\d{2}-\d{3}$/, "Kod pocztowy musi być w formacie XX-XXX"),
  voivodeship: z.string().min(1, "Wybierz województwo"),
  email: z.string().email("Podaj prawidłowy adres e-mail"),
  phone: z
    .string()
    .regex(/^(\+48)?[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}$/, "Podaj prawidłowy numer telefonu"),
  password: z
    .string()
    .min(8, "Hasło musi mieć co najmniej 8 znaków").max(72, "Hasło może mieć maksymalnie 72 znaki")
    .regex(/[A-Z]/, "Hasło musi zawierać co najmniej jedną wielką literę")
    .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hasła muszą się zgadzać",
  path: ["confirmPassword"],
});

export type RegisterOrganizationInput = z.infer<typeof registerOrganizationSchema>;

// ============================================
// Walidacja logowania
// ============================================
export const loginSchema = z.object({
  email: z.string().email("Podaj prawidłowy adres e-mail"),
  password: z.string().min(1, "Hasło jest wymagane"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ============================================
// Walidacja ogłoszenia — Krok 1: Dane podstawowe
// ============================================
export const announcementStep1Schema = z.object({
  procedureNumber: z
    .string()
    .min(1, "Numer postępowania jest wymagany"),
  title: z
    .string()
    .min(10, "Tytuł musi mieć co najmniej 10 znaków")
    .max(500, "Tytuł może mieć maksymalnie 500 znaków"),
  orderType: z.enum(["SUPPLIES", "SERVICES", "CONSTRUCTION"], {
    errorMap: () => ({ message: "Wybierz rodzaj zamówienia" }),
  }),
  voivodeship: z.string().min(1, "Wybierz województwo"),
  location: z.string().min(2, "Podaj miejscowość realizacji"),
  executionTerm: z.string().min(1, "Podaj termin realizacji"),
});

export type AnnouncementStep1Input = z.infer<typeof announcementStep1Schema>;

// ============================================
// Walidacja ogłoszenia — Krok 2: Opis
// ============================================
export const announcementStep2Schema = z.object({
  description: z
    .string()
    .refine(
      (value) => value.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().length >= 50,
      "Opis przedmiotu zamówienia musi mieć co najmniej 50 znaków"
    ),
});

export type AnnouncementStep2Input = z.infer<typeof announcementStep2Schema>;

// ============================================
// Walidacja ogłoszenia — Krok 3: Warunki udziału
// ============================================
export const announcementStep3Schema = z.object({
  conditions: z.string().optional(),
});

export type AnnouncementStep3Input = z.infer<typeof announcementStep3Schema>;

// ============================================
// Walidacja ogłoszenia — Krok 4: Kryteria oceny
// ============================================
export const evaluationCriteriaItemSchema = z.object({
  name: z.string().min(1, "Nazwa kryterium jest wymagana"),
  weight: z.number().min(1, "Waga musi być większa niż 0").max(100, "Waga nie może przekraczać 100"),
  description: z.string().optional(),
});

export const announcementStep4Schema = z.object({
  criteria: z
    .array(evaluationCriteriaItemSchema)
    .min(1, "Dodaj co najmniej jedno kryterium oceny"),
}).refine(
  (data) => {
    const totalWeight = data.criteria.reduce((sum, c) => sum + c.weight, 0);
    return Math.abs(totalWeight - 100) < 0.01;
  },
  {
    message: "Suma wag kryteriów musi wynosić 100%",
    path: ["criteria"],
  }
);

export type AnnouncementStep4Input = z.infer<typeof announcementStep4Schema>;

// ============================================
// Walidacja ogłoszenia — Krok 5: Terminy
// ============================================
export const announcementStep5Schema = z.object({
  publishedAt: z.string().min(1, "Data publikacji jest wymagana"),
  bidsDeadline: z.string().min(1, "Termin składania ofert jest wymagany"),
}).refine(
  (data) => {
    if (data.publishedAt && data.bidsDeadline) {
      return new Date(data.bidsDeadline) > new Date(data.publishedAt);
    }
    return true;
  },
  {
    message: "Termin składania ofert musi być późniejszy niż data publikacji",
    path: ["bidsDeadline"],
  }
);

export type AnnouncementStep5Input = z.infer<typeof announcementStep5Schema>;

// ============================================
// Walidacja ogłoszenia — Krok 6: Kontakt
// ============================================
export const announcementStep6Schema = z.object({
  contactPerson: z.string().optional(),
  contactEmail: z.string().email("Podaj prawidłowy adres e-mail").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  submissionMethod: z.string().optional(),
});

export type AnnouncementStep6Input = z.infer<typeof announcementStep6Schema>;

// ============================================
// Walidacja rozstrzygnięcia
// ============================================
export const procurementResultSchema = z.object({
  contractorName: z.string().min(3, "Nazwa wykonawcy jest wymagana"),
  contractorNip: z
    .string()
    .regex(/^\d{10}$/, "NIP musi składać się z 10 cyfr")
    .optional()
    .or(z.literal("")),
  price: z
    .number({ invalid_type_error: "Podaj prawidłową cenę" })
    .positive("Cena musi być większa niż 0").max(9999999999.99).multipleOf(0.01),
  justification: z
    .string()
    .min(20, "Uzasadnienie wyboru musi mieć co najmniej 20 znaków"),
});

export type ProcurementResultInput = z.infer<typeof procurementResultSchema>;

// ============================================
// Walidacja unieważnienia
// ============================================
export const cancellationSchema = z.object({
  cancellationReason: z
    .string()
    .min(20, "Uzasadnienie unieważnienia musi mieć co najmniej 20 znaków"),
});

export type CancellationInput = z.infer<typeof cancellationSchema>;

// ============================================
// Walidacja pytania
// ============================================
export const questionSchema = z.object({
  content: z.string().min(10, "Treść pytania musi mieć co najmniej 10 znaków"),
  authorName: z.string().optional(),
  authorEmail: z.string().email().optional().or(z.literal("")),
});

export type QuestionInput = z.infer<typeof questionSchema>;

// ============================================
// Walidacja odpowiedzi
// ============================================
export const answerSchema = z.object({
  content: z.string().trim().min(5, "Treść odpowiedzi musi mieć co najmniej 5 znaków").max(10000),
});

export type AnswerInput = z.infer<typeof answerSchema>;

// ============================================
// Walidacja wiadomości
// ============================================
export const newsSchema = z.object({
  title: z.string().min(5, "Tytuł musi mieć co najmniej 5 znaków"),
  content: z.string().min(20, "Treść musi mieć co najmniej 20 znaków"),
  excerpt: z.string().optional(),
  isPublished: z.boolean().default(false),
});

export type NewsInput = z.infer<typeof newsSchema>;

// ============================================
// Walidacja parametrów zapytania
// ============================================
export const announcementQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.enum(["PUBLISHED", "IN_PROGRESS", "RESOLVED", "CANCELLED", "COMPLETED"]).optional(),
  orderType: z.enum(["SUPPLIES", "SERVICES", "CONSTRUCTION"]).optional(),
  voivodeship: z.string().optional(),
  organizationId: z.string().optional(),
  sortBy: z.enum(["newest", "oldest", "deadline"]).default("newest"),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export type AnnouncementQueryInput = z.infer<typeof announcementQuerySchema>;
