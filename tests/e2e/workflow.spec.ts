import { test, expect, request as requestFactory, type APIRequestContext } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import AxeBuilder from "@axe-core/playwright";

const db = new PrismaClient();
const password = "Integration123!";
let admin: APIRequestContext;
let owner: APIRequestContext;
let other: APIRequestContext;
let organizationId: string;
let otherOrgId: string;
let announcementId: string;
let questionId: string;
let newsId: string;
let upload: { id: string; fileName: string; filePath: string };

async function login(email: string, pass = password) {
  const api = await requestFactory.newContext({ baseURL: "http://localhost:3100" });
  const csrf = await (await api.get("/api/auth/csrf")).json();
  await api.post("/api/auth/callback/credentials", { form: { csrfToken: csrf.csrfToken, email, password: pass, callbackUrl: "http://localhost:3100/panel" } });
  return api;
}
const announcement = (number: string) => ({
  procedureNumber: number, title: "Zakup sprzętu komputerowego dla organizacji", orderType: "SUPPLIES",
  description: "<p>Przedmiotem zamówienia jest dostawa pięciu komputerów wraz z instalacją i konfiguracją.</p>",
  voivodeship: "mazowieckie", location: "Warszawa", executionTerm: "30 dni od podpisania umowy",
  criteria: [{ name: "Cena", weight: 100 }], publishedAt: new Date(Date.now() - 60000).toISOString(),
  bidsDeadline: new Date(Date.now() + 86400000).toISOString(), status: "DRAFT", conditions: "",
});
test.describe.serial("Complete procurement workflow and security", () => {
  test.beforeAll(async () => {
    if (!new URL(process.env.DATABASE_URL!).pathname.endsWith("_test")) throw new Error("Unsafe test database");
    await db.emailOutbox.deleteMany(); await db.rateLimit.deleteMany(); await db.passwordReset.deleteMany();
    await db.auditLog.deleteMany(); await db.announcement.deleteMany(); await db.news.deleteMany(); await db.user.deleteMany(); await db.organization.deleteMany();
    await db.user.create({ data: { email: "admin@example.test", password: await bcrypt.hash(password, 12), role: "ADMIN", name: "Administrator testowy" } });
    admin = await login("admin@example.test");
  });
  test.afterAll(async () => { await Promise.all([admin?.dispose(), owner?.dispose(), other?.dispose()]); await db.$disconnect(); });

  test("registration, activation, profile edits, safe user data and ownership", async ({ request }) => {
    const data = { organizationName: "Organizacja testowa", nip: "1234567890", regon: "123456789", address: "Testowa 10", city: "Warszawa", postalCode: "00-001", voivodeship: "mazowieckie", email: "owner@example.test", phone: "123456789", password, confirmPassword: password };
    const registration = await request.post("/api/organizations", { data }); expect(registration.status()).toBe(201);
    const org = await registration.json(); organizationId = org.id; expect(JSON.stringify(org)).not.toContain('"password"');
    const pending = await login(data.email); expect((await pending.post("/api/announcements", { data: announcement("denied") })).status()).toBe(401); await pending.dispose();
    expect((await request.put(`/api/organizations/${organizationId}`, { data: { name: "Atak" } })).status()).toBe(401);
    expect((await request.get(`/api/organizations/${organizationId}`)).status()).toBe(401);
    expect((await admin.put(`/api/organizations/${organizationId}`, { data: { status: "ACTIVE" } })).status()).toBe(200);
    expect(await db.emailOutbox.count({ where: { to: data.email, subject: "Aktywacja konta organizacji" } })).toBe(1);
    owner = await login(data.email);
    expect((await owner.put(`/api/organizations/${organizationId}`, { data: { city: "Kraków", address: "Nowa 20" } })).status()).toBe(200);
    expect((await db.organization.findUniqueOrThrow({ where: { id: organizationId } })).city).toBe("Kraków");
    expect((await owner.put(`/api/organizations/${organizationId}`, { data: { status: "ACTIVE" } })).status()).toBe(403);
    const second = await request.post("/api/organizations", { data: { ...data, nip: "1234567891", regon: "123456788", email: "other@example.test" } });
    expect(second.status()).toBe(201); otherOrgId = (await second.json()).id;
    await admin.put(`/api/organizations/${otherOrgId}`, { data: { status: "ACTIVE" } }); other = await login("other@example.test");
    expect((await other.get(`/api/organizations/${organizationId}`)).status()).toBe(403);
    expect((await other.put(`/api/organizations/${organizationId}`, { data: { name: "Cudza organizacja" } })).status()).toBe(403);
    const users = await admin.get("/api/users?page=invalid&limit=-1"); expect(users.ok()).toBeTruthy(); expect(await users.text()).not.toContain('"password"');
    expect(await (await admin.get("/api/auditlogs")).text()).not.toContain('"password"');
  });

  test("draft confidentiality, protected attachment, atomic publication and editing", async ({ request, page }) => {
    const file = await owner.post("/api/upload", { multipart: { file: { name: "Załącznik.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\n%%EOF") } } });
    expect(file.status()).toBe(201); upload = (await file.json()).file;
    const response = await owner.post("/api/announcements", { data: { ...announcement("TEST/001"), attachmentIds: [upload.id] } });
    expect(response.status()).toBe(201); announcementId = (await response.json()).id;
    expect((await request.get(`/api/announcements/${announcementId}`)).status()).toBe(404);
    expect((await request.get(upload.filePath)).status()).toBe(404);
    expect((await owner.get(upload.filePath)).status()).toBe(200);
    expect((await owner.delete("/api/upload", { data: { id: upload.id } })).status()).toBe(409);
    expect((await other.put(`/api/announcements/${announcementId}`, { data: { title: "Zmiana cudzej treści" } })).status()).toBe(403);
    expect((await request.get("/api/announcements?status=DRAFT")).status()).toBe(400);
    expect((await page.goto(`/ogloszenia/${announcementId}`))?.status()).toBe(404);
    expect(await page.title()).not.toContain("TEST/001");
    await page.context().addCookies((await owner.storageState()).cookies);
    await page.goto(`/panel/ogloszenia/${announcementId}/edycja`);
    await page.getByRole("button", { name: "Opublikuj", exact: true }).click(); await expect(page).toHaveURL(/\/panel\/ogloszenia$/);
    expect((await request.get(`/api/announcements/${announcementId}`)).status()).toBe(200);
    expect((await request.get(upload.filePath)).status()).toBe(200);
    expect((await owner.put(`/api/announcements/${announcementId}`, { data: { criteria: [{ name: "Cena", weight: 80 }] } })).status()).toBe(400);
    expect((await owner.put(`/api/announcements/${announcementId}`, { data: { criteria: [{ name: "Cena", weight: 80 }, { name: "Gwarancja", weight: 20 }] } })).status()).toBe(200);
    expect((await owner.put(`/api/announcements/${announcementId}`, { data: { status: "DRAFT" } })).status()).toBe(409);
    expect((await owner.delete(`/api/announcements/${announcementId}`)).status()).toBe(400);
    const future = await owner.post("/api/announcements", { data: { ...announcement("TEST/FUTURE"), status: "PUBLISHED", publishedAt: new Date(Date.now() + 3600000).toISOString() } });
    expect(future.status()).toBe(201); const futureId = (await future.json()).id;
    expect((await request.get(`/api/announcements/${futureId}`)).status()).toBe(404);
    expect(await (await request.get("/api/announcements")).text()).not.toContain("TEST/FUTURE");
    expect(await (await request.get("/ogloszenia?status=DRAFT")).text()).not.toContain("TEST/FUTURE");
  });

  test("question form, private contact data and cross-announcement answer protection", async ({ page, request }) => {
    await page.goto(`/ogloszenia/${announcementId}`);
    await page.getByLabel("Imię i nazwisko / Nazwa firmy").fill("Pytający testowy");
    await page.getByLabel("E-mail", { exact: true }).fill("bidder@example.test");
    await page.getByLabel("Treść pytania").fill("Czy dopuszczają Państwo dostawę w dwóch partiach?");
    await page.getByRole("button", { name: "Wyślij pytanie" }).click(); await expect(page.getByRole("status")).toContainText("Pytanie zostało zapisane");
    const questions = await (await owner.get(`/api/announcements/${announcementId}/questions`)).json(); questionId = questions[0].id;
    const publicResponse = await request.get(`/api/announcements/${announcementId}/questions`); expect(await publicResponse.text()).not.toContain("bidder@example.test");
    const privateQuestion = await db.question.create({ data: { announcementId, content: "Prywatna treść testowa", isPublic: false } });
    expect(await (await request.get(`/api/announcements/${announcementId}`)).text()).not.toContain(privateQuestion.content);
    expect((await other.post(`/api/announcements/${announcementId}/questions/${questionId}/answers`, { data: { content: "Cudza odpowiedź" } })).status()).toBe(403);
    const second = await other.post("/api/announcements", { data: { ...announcement("TEST/OTHER"), status: "PUBLISHED" } }); const secondId = (await second.json()).id;
    expect((await other.post(`/api/announcements/${secondId}/questions/${questionId}/answers`, { data: { content: "Cudza odpowiedź" } })).status()).toBe(404);
    expect((await owner.post(`/api/announcements/${announcementId}/questions/${questionId}/answers`, { data: { content: "Tak, dopuszczamy dwie dostawy." } })).status()).toBe(201);
    await page.reload(); await expect(page.getByText("Tak, dopuszczamy dwie dostawy.")).toBeVisible();
  });

  test("deadline, resolution, cancellation and duplicate submission", async ({ request, page }) => {
    const result = { action: "RESOLVE", contractorName: "Wybrany wykonawca", contractorNip: "1234567890", price: "12345.67", justification: "Oferta uzyskała najwyższą liczbę punktów w kryteriach oceny." };
    expect((await owner.post(`/api/announcements/${announcementId}/resolve`, { data: result })).status()).toBe(409);
    await db.announcement.update({ where: { id: announcementId }, data: { bidsDeadline: new Date(Date.now() - 1000) } });
    expect((await request.post(`/api/announcements/${announcementId}/questions`, { data: { authorEmail: "test@example.test", content: "Pytanie po terminie składania ofert" } })).status()).toBe(409);
    expect((await owner.post(`/api/announcements/${announcementId}/resolve`, { data: { ...result, price: "0" } })).status()).toBe(400);
    const results = await Promise.all([owner.post(`/api/announcements/${announcementId}/resolve`, { data: result }), owner.post(`/api/announcements/${announcementId}/resolve`, { data: result })]);
    expect(results.map(r => r.status()).sort()).toEqual([200, 409]);
    expect(await db.procurementResult.count({ where: { announcementId } })).toBe(1);
    await page.goto(`/ogloszenia/${announcementId}`); await expect(page.getByText("Wybrany wykonawca", { exact: true }).last()).toBeVisible(); await expect(page.getByText(result.justification)).toBeVisible();
    expect((await owner.put(`/api/announcements/${announcementId}`, { data: { title: "Edycja po zakończeniu" } })).status()).toBe(409);
    const toCancel = await owner.post("/api/announcements", { data: { ...announcement("TEST/CANCEL"), status: "PUBLISHED" } }); const cancelId = (await toCancel.json()).id;
    expect((await owner.post(`/api/announcements/${cancelId}/resolve`, { data: { action: "CANCEL", cancellationReason: "Brak środków na realizację przedmiotu zamówienia." } })).status()).toBe(200);
    await page.goto(`/ogloszenia/${cancelId}`); await expect(page.getByText("Brak środków na realizację przedmiotu zamówienia.")).toBeVisible();
    const draft = await owner.post("/api/announcements", { data: announcement("TEST/DELETE") }); const draftId = (await draft.json()).id;
    expect((await owner.delete(`/api/announcements/${draftId}`)).status()).toBe(204);
  });

  test("contact queue, password reset, one-time token and session revocation", async ({ page, request }) => {
    await page.goto("/kontakt"); await page.getByLabel("Imię i nazwisko").fill("Jan Testowy"); await page.getByLabel("Adres e-mail").fill("contact-user@example.test");
    await page.getByLabel("Temat").fill("Pytanie o działanie systemu"); await page.getByLabel("Wiadomość", { exact: true }).fill("Proszę o wyjaśnienie działania systemu zamówień.");
    await page.getByRole("button", { name: "Wyślij wiadomość" }).click();
    await expect.poll(() => db.emailOutbox.count({ where: { replyTo: "contact-user@example.test" } })).toBe(1);
    const unknown = await (await request.post("/api/password/forgot", { data: { email: "missing@example.test" } })).json();
    const known = await (await request.post("/api/password/forgot", { data: { email: "owner@example.test" } })).json(); expect(known).toEqual(unknown);
    const mail = await db.emailOutbox.findFirstOrThrow({ where: { to: "owner@example.test", subject: "Ustaw nowe hasło" }, orderBy: { createdAt: "desc" } });
    const token = mail.text.match(/token=([a-f0-9]{64})/)![1];
    await page.goto(`/nowe-haslo#token=${token}`); await page.getByLabel("Nowe hasło", { exact: true }).fill("Changed123!"); await page.getByLabel("Powtórz hasło").fill("Changed123!");
    await page.getByRole("button", { name: "Zmień hasło" }).click(); await expect(page.getByRole("status")).toContainText("Hasło zmienione");
    expect((await request.post("/api/password/reset", { data: { token, password } })).status()).toBe(400);
    expect((await owner.get(`/api/organizations/${organizationId}`)).status()).toBe(401);
    await owner.dispose(); owner = await login("owner@example.test", "Changed123!"); expect((await owner.get(`/api/organizations/${organizationId}`)).status()).toBe(200);
    await admin.put(`/api/organizations/${organizationId}`, { data: { status: "BLOCKED" } });
    expect((await owner.get(`/api/organizations/${organizationId}`)).status()).toBe(401);
    await admin.put(`/api/organizations/${organizationId}`, { data: { status: "ACTIVE" } });
    expect((await owner.get(`/api/organizations/${organizationId}`)).status()).toBe(401);
    await owner.dispose(); owner = await login("owner@example.test", "Changed123!");
  });

  test("admin CMS creates, previews, schedules, withdraws and deletes news", async ({ page, request }) => {
    expect((await request.get("/api/news?scope=admin")).status()).toBe(401);
    expect((await admin.post("/api/news", { data: {
      title: "Nieprawidłowy termin publikacji",
      content: "<p>Treść wpisu z nieprawidłowym terminem.</p>",
      status: "SCHEDULED",
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
    } })).status()).toBe(400);
    const scheduledTitle = "Zaplanowana wiadomość z CMS";
    const scheduled = await admin.post("/api/news", { data: {
      title: scheduledTitle,
      content: "<p>Ta wiadomość pojawi się dopiero w przyszłości.</p>",
      excerpt: "Zaplanowany wpis",
      status: "SCHEDULED",
      publishedAt: new Date(Date.now() + 3600000).toISOString(),
    } });
    expect(scheduled.status()).toBe(201);
    const scheduledItem = await scheduled.json();
    expect(await (await request.get("/api/news")).text()).not.toContain(scheduledTitle);

    await page.context().addCookies((await admin.storageState()).cookies);
    await page.goto("/admin/organizacje");
    await expect(page.getByText("Aktywna", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("ACTIVE", { exact: true })).toHaveCount(0);
    await page.goto("/admin/uzytkownicy");
    await expect(page.getByText("Administrator", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Aktywny", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("ADMIN", { exact: true })).toHaveCount(0);
    await expect(page.getByText("ACTIVE", { exact: true })).toHaveCount(0);
    await page.goto("/admin/ogloszenia");
    await expect(page.locator("tbody").getByText(/Rozstrzygnięte|Unieważnione|Opublikowane/, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/RESOLVED|CANCELLED|PUBLISHED/, { exact: true })).toHaveCount(0);
    await page.goto("/admin/aktualnosci/nowa");
    const formAccessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(formAccessibility.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
    await page.getByLabel("Tytuł").fill("Aktualność utworzona w CMS");
    await page.getByLabel("Treść aktualności").fill("Pełna treść wpisu utworzonego przez administratora.");
    await page.getByLabel("Opis SEO i skrót").fill("Opis wpisu CMS");
    await page.getByLabel("Status").selectOption("PUBLISHED");
    await page.getByRole("button", { name: "Zapisz aktualność" }).click();
    await expect(page).toHaveURL(/\/admin\/aktualnosci$/);
    await expect(page.getByText("Aktualność utworzona w CMS", { exact: true })).toBeVisible();

    const created = await db.news.findFirstOrThrow({ where: { title: "Aktualność utworzona w CMS" } });
    expect((await request.get(`/aktualnosci/${created.id}`)).status()).toBe(200);
    await page.goto(`/admin/aktualnosci/${created.id}/podglad`);
    await expect(page.getByRole("heading", { name: created.title })).toBeVisible();
    await page.getByRole("link", { name: "Edytuj" }).click();
    await page.getByLabel("Tytuł").fill("Aktualność wycofana do szkicu");
    await page.getByLabel("Status").selectOption("DRAFT");
    await page.getByRole("button", { name: "Zapisz aktualność" }).click();
    await expect(page).toHaveURL(/\/admin\/aktualnosci$/);
    expect((await request.get(`/aktualnosci/${created.id}`)).status()).toBe(404);

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Usuń: Aktualność wycofana do szkicu" }).click();
    await expect(page.getByText("Aktualność wycofana do szkicu", { exact: true })).toHaveCount(0);
    expect(await db.auditLog.count({ where: { entity: "NEWS", entityId: created.id } })).toBeGreaterThanOrEqual(3);
    expect((await admin.delete(`/api/news/${scheduledItem.id}`)).status()).toBe(204);
  });

  test("published news is navigable while drafts and scheduled entries stay private", async ({ page, request }) => {
    const published = await db.news.create({
      data: {
        title: "Nowe zasady publikacji ogłoszeń",
        excerpt: "Krótka informacja o zmianach w systemie.",
        content: "<p>Pełna treść aktualności dostępna dla wszystkich użytkowników.</p><script>window.__unsafe = true</script>",
        isPublished: true,
        publishedAt: new Date(Date.now() - 1000),
      },
    });
    newsId = published.id;
    const draft = await db.news.create({
      data: { title: "Szkic aktualności", content: "Treść szkicu", isPublished: false },
    });
    const scheduled = await db.news.create({
      data: { title: "Zaplanowana aktualność", content: "Treść przyszłego wpisu", isPublished: true, publishedAt: new Date(Date.now() + 3600000) },
    });

    await page.goto("/");
    await page.getByRole("link", { name: published.title }).click();
    await expect(page).toHaveURL(`/aktualnosci/${published.id}`);
    await expect(page.getByRole("heading", { name: published.title })).toBeVisible();
    await expect(page.getByText("Pełna treść aktualności dostępna dla wszystkich użytkowników.")).toBeVisible();
    await expect(page.locator("article script")).toHaveCount(0);

    await page.goto("/aktualnosci");
    await expect(page.getByRole("link", { name: published.title })).toBeVisible();
    await expect(page.getByText(draft.title)).toHaveCount(0);
    await expect(page.getByText(scheduled.title)).toHaveCount(0);
    expect((await request.get(`/aktualnosci/${draft.id}`)).status()).toBe(404);
    expect((await request.get(`/aktualnosci/${scheduled.id}`)).status()).toBe(404);
    const apiBody = await (await request.get("/api/news")).text();
    expect(apiBody).toContain(published.title);
    expect(apiBody).not.toContain(draft.title);
    expect(apiBody).not.toContain(scheduled.title);
  });

  test("mobile layout, accessible public forms and authenticated navigation", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const path of ["/", "/ogloszenia", "/aktualnosci", `/aktualnosci/${newsId}`, "/logowanie", "/rejestracja", "/odzyskaj-haslo", "/kontakt", "/faq", "/o-systemie", `/ogloszenia/${announcementId}`]) {
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), path).toBeTruthy();
      const report = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      expect(report.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), path).toEqual([]);
    }
    await page.context().addCookies((await owner.storageState()).cookies); await page.goto("/panel");
    await page.getByRole("button", { name: "Menu panelu" }).click(); await page.getByRole("link", { name: "Profil organizacji" }).click();
    await expect(page.getByRole("heading", { name: "Profil organizacji" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
    await page.screenshot({ path: "test-results/mobile-profile.png", fullPage: true });
  });
});
