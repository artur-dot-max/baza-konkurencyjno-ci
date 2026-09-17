import { test } from "node:test";
import assert from "node:assert/strict";
import { createUploadToken, verifyUploadToken } from "../../src/lib/upload-token";
import { sanitizeRichText } from "../../src/lib/sanitize";
import { announcementSchema } from "../../src/lib/announcement-validation";
import { canReadAnnouncement, pagination } from "../../src/lib/access";

test("upload signature prevents tampering, cross-user reuse, and expired uploads", () => {
  process.env.AUTH_SECRET = "unit-test-only-secret";
  const payload = { userId: "owner", fileName: "file.pdf", originalName: "file.pdf", mimeType: "application/pdf", fileSize: 20, filePath: "/api/uploads/file.pdf", expiresAt: Date.now() + 60000 };
  const token = createUploadToken(payload);
  assert.ok(verifyUploadToken(token, "owner")); assert.equal(verifyUploadToken(token, "other"), null);
  assert.equal(verifyUploadToken(token + "x", "owner"), null);
  assert.equal(verifyUploadToken(createUploadToken({ ...payload, expiresAt: Date.now() - 1 }), "owner"), null);
});
test("stored rich text strips executable content and unsafe links", () => {
  const html = sanitizeRichText('<p onclick="alert(1)">Opis<script>alert(1)</script><a href="javascript:alert(1)">link</a><img src=x onerror=alert(1)></p>');
  assert.ok(html.includes("Opis")); assert.doesNotMatch(html, /script|onclick|onerror|javascript:/i);
});
test("draft and future announcement cannot be read anonymously", () => {
  assert.equal(canReadAnnouncement(null, { status: "DRAFT", publishedAt: new Date(0), organizationId: "a" }), false);
  assert.equal(canReadAnnouncement(null, { status: "PUBLISHED", publishedAt: new Date(Date.now() + 100000), organizationId: "a" }), false);
  assert.equal(canReadAnnouncement(null, { status: "PUBLISHED", publishedAt: new Date(0), organizationId: "a" }), true);
  assert.deepEqual(pagination("https://test/?page=NaN&limit=999999"), { page: 1, limit: 100, skip: 0 });
});
test("publication rejects invalid dates, expired deadlines and criteria totals", () => {
  const data = { procedureNumber: "1", title: "Dostawa komputerów", description: "Opis zamówienia ".repeat(10), orderType: "SUPPLIES", voivodeship: "mazowieckie", location: "Warszawa", executionTerm: "30 dni", criteria: [{ name: "Cena", weight: 100 }], status: "PUBLISHED", publishedAt: new Date().toISOString(), bidsDeadline: new Date(Date.now() + 100000).toISOString() };
  assert.equal(announcementSchema.safeParse(data).success, true);
  assert.equal(announcementSchema.safeParse({ ...data, bidsDeadline: "not-a-date" }).success, false);
  assert.equal(announcementSchema.safeParse({ ...data, bidsDeadline: new Date(0).toISOString() }).success, false);
  assert.equal(announcementSchema.safeParse({ ...data, criteria: [{ name: "Cena", weight: 99 }] }).success, false);
});
