import { PrismaClient, UserRole, OrganizationStatus, AnnouncementStatus, OrderType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_INSECURE_SEED !== "true") {
    throw new Error("Development seed is disabled in production");
  }
  console.log("Starting seed...");

  // Clear existing data
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.news.deleteMany(),
    prisma.announcementHistory.deleteMany(),
    prisma.question.deleteMany(),
    prisma.evaluationCriteria.deleteMany(),
    prisma.procurementResult.deleteMany(),
    prisma.announcement.deleteMany(),
    prisma.user.deleteMany(),
    prisma.organization.deleteMany(),
  ]);

  const hashedAdminPassword = await bcrypt.hash("Admin123!", 10);
  const hashedUserPassword = await bcrypt.hash("Haslo123!", 10);

  // Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@fs.gov.pl",
      password: hashedAdminPassword,
      name: "Administrator",
      role: UserRole.ADMIN,
    },
  });

  // Organizations
  const org1 = await prisma.organization.create({
    data: {
      name: "Fundacja Pomocy Prawnej",
      nip: "1234567890",
      regon: "123456789",
      status: OrganizationStatus.ACTIVE,
      voivodeship: "mazowieckie",
      city: "Warszawa",
      postalCode: "00-001",
      address: "ul. Wiejska 1",
      email: "org1@example.com",
      phone: "123456789",
      users: {
        create: {
          email: "org1@example.com",
          password: hashedUserPassword,
          name: "Jan Kowalski",
          role: UserRole.ORGANIZATION,
        },
      },
    },
  });

  const org2 = await prisma.organization.create({
    data: {
      name: "Stowarzyszenie Ochrony Ofiar",
      nip: "9876543210",
      regon: "987654321",
      status: OrganizationStatus.ACTIVE,
      voivodeship: "małopolskie",
      city: "Kraków",
      postalCode: "30-001",
      address: "ul. Grodzka 2",
      email: "org2@example.com",
      phone: "987654321",
      users: {
        create: {
          email: "org2@example.com",
          password: hashedUserPassword,
          name: "Anna Nowak",
          role: UserRole.ORGANIZATION,
        },
      },
    },
  });

  const org3 = await prisma.organization.create({
    data: {
      name: "Centrum Wsparcia Rodzin",
      nip: "5555555555",
      regon: "555555555",
      status: OrganizationStatus.PENDING,
      voivodeship: "śląskie",
      city: "Katowice",
      postalCode: "40-001",
      address: "al. Korfantego 3",
      email: "org3@example.com",
      phone: "555555555",
      users: {
        create: {
          email: "org3@example.com",
          password: hashedUserPassword,
          name: "Piotr Wiśniewski",
          role: UserRole.ORGANIZATION,
        },
      },
    },
  });

  const orgs = [org1, org2];

  // Announcements
  const announcementsData = [
    {
      title: "Zakup sprzętu komputerowego",
      type: OrderType.SUPPLIES,
      status: AnnouncementStatus.PUBLISHED,
      org: org1,
    },
    {
      title: "Świadczenie usług szkoleniowych",
      type: OrderType.SERVICES,
      status: AnnouncementStatus.PUBLISHED,
      org: org2,
    },
    {
      title: "Remont pomieszczeń biurowych",
      type: OrderType.CONSTRUCTION,
      status: AnnouncementStatus.IN_PROGRESS,
      org: org1,
    },
    {
      title: "Dostawa materiałów biurowych",
      type: OrderType.SUPPLIES,
      status: AnnouncementStatus.RESOLVED,
      org: org2,
    },
    {
      title: "Usługi transportowe",
      type: OrderType.SERVICES,
      status: AnnouncementStatus.CANCELLED,
      org: org1,
    },
    {
      title: "Budowa placu zabaw",
      type: OrderType.CONSTRUCTION,
      status: AnnouncementStatus.COMPLETED,
      org: org2,
    },
    {
      title: "Zakup mebli biurowych",
      type: OrderType.SUPPLIES,
      status: AnnouncementStatus.DRAFT,
      org: org1,
    },
    {
      title: "Usługi doradztwa prawnego",
      type: OrderType.SERVICES,
      status: AnnouncementStatus.PUBLISHED,
      org: org2,
    },
    {
      title: "Dostawa artykułów spożywczych",
      type: OrderType.SUPPLIES,
      status: AnnouncementStatus.PUBLISHED,
      org: org1,
    },
    {
      title: "Usługi sprzątania",
      type: OrderType.SERVICES,
      status: AnnouncementStatus.IN_PROGRESS,
      org: org2,
    },
  ];

  for (let i = 0; i < announcementsData.length; i++) {
    const data = announcementsData[i];
    const now = new Date();
    const isPublished = data.status !== AnnouncementStatus.DRAFT;
    const publishDate = isPublished ? new Date(now.getTime() - i * 86400000 * 5) : null;
    const endDate = isPublished ? new Date(publishDate!.getTime() + 86400000 * 14) : new Date(now.getTime() + 86400000 * 30);

    const announcement = await prisma.announcement.create({
      data: {
        title: data.title,
        description: `Przedmiotem zamówienia jest ${data.title.toLowerCase()}. Szczegółowe wymagania zostały określone w zapytaniu ofertowym.`,
        procedureNumber: `ZAP/${now.getFullYear()}/${String(i + 1).padStart(4, "0")}`,
        orderType: data.type,
        status: data.status,
        organizationId: data.org.id,
        publishedAt: publishDate,
        bidsDeadline: endDate,
        voivodeship: data.org.voivodeship,
        location: data.org.city,
        executionTerm: "30 dni od podpisania umowy",
        contactPerson: "Jan Kowalski",
        contactEmail: "kontakt@example.com",
        contactPhone: "123456789",
        conditions: "1. Posiadanie uprawnień. 2. Dysponowanie potencjałem technicznym.",
        cancellationReason: data.status === AnnouncementStatus.CANCELLED ? "Brak ofert spełniających wymagania" : null,
      },
    });

    await prisma.evaluationCriteria.createMany({
      data: [
        { name: "Cena", weight: 60, description: "Cena brutto oferty", announcementId: announcement.id },
        { name: "Doświadczenie", weight: 25, description: "Doświadczenie wykonawcy", announcementId: announcement.id },
        { name: "Termin realizacji", weight: 15, description: "Deklarowany termin realizacji w dniach", announcementId: announcement.id },
      ],
    });

    if (isPublished) {
      await prisma.announcementHistory.create({
        data: {
          announcementId: announcement.id,
          action: "PUBLISH",
          details: "Opublikowano ogłoszenie",
          userId: adminUser.id,
        }
      });
    }

    if (data.status === AnnouncementStatus.RESOLVED || data.status === AnnouncementStatus.COMPLETED) {
      await prisma.procurementResult.create({
        data: {
          announcementId: announcement.id,
          contractorName: "Firma Wykonawcza sp. z o.o.",
          contractorNip: "1111111111",
          price: 15000.50,
          justification: "Najkorzystniejsza oferta na podstawie przyjętych kryteriów oceny.",
        }
      });
    }

    if (i % 3 === 0 && isPublished) {
       await prisma.question.create({
         data: {
           announcementId: announcement.id,
           content: "Czy dopuszczają Państwo wariantowe wykonanie przedmiotu zamówienia?",
            answers: {
              create: { content: "Nie, zamawiający nie dopuszcza składania ofert wariantowych." }
            }
         }
       });
    }
  }

  // News items
  const newsTitles = [
    "System Baza Konkurencyjności uruchomiony",
    "Nowe zasady składania ofert",
    "Szkolenie dla organizacji pozarządowych",
    "Aktualizacja regulaminu",
    "Podsumowanie I kwartału"
  ];

  for (let i = 0; i < newsTitles.length; i++) {
    await prisma.news.create({
      data: {
        title: newsTitles[i],
        content: `Treść wiadomości: ${newsTitles[i]}. Zapraszamy do zapoznania się ze szczegółami...`,
        isPublished: true,
        publishedAt: new Date(Date.now() - i * 86400000),
      }
    });
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
