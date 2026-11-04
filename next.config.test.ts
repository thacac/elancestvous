import { describe, expect, it } from "vitest";

import nextConfig from "./next.config";

// The site was missing every standard security response header (verified
// live via curl: no Strict-Transport-Security, X-Content-Type-Options,
// X-Frame-Options, Referrer-Policy, or Permissions-Policy on any page) —
// there was no `headers()` in next.config at all.
describe("next.config security headers", () => {
  it("applies security headers to every route", async () => {
    expect(nextConfig.headers).toBeTypeOf("function");
    const rules = await nextConfig.headers!();
    const allRoutes = rules.find((rule) => rule.source === "/(.*)");
    expect(allRoutes).toBeDefined();

    const byKey = Object.fromEntries(
      allRoutes!.headers.map((h) => [h.key, h.value]),
    );
    expect(byKey["X-Content-Type-Options"]).toBe("nosniff");
    expect(byKey["X-Frame-Options"]).toBe("DENY");
    expect(byKey["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(byKey["Strict-Transport-Security"]).toContain("max-age=");
    expect(byKey["Permissions-Policy"]).toBeDefined();
  });
});

// Migration IA (Epic 2) : les anciennes pages sont dépubliées (Story 2.7),
// ces redirections évitent qu'un lien partagé, indexé ou en favori
// n'atterrisse sur une 404 — cf. epics.md Story 2.7.
describe("next.config redirects — anciennes URLs migrées (Story 2.7)", () => {
  it("redirects each old URL to its new one in 301 (permanent)", async () => {
    expect(nextConfig.redirects).toBeTypeOf("function");
    const rules = await nextConfig.redirects!();

    const byOldSource = Object.fromEntries(rules.map((r) => [r.source, r]));

    expect(byOldSource["/particuliers/coaching-individuel"]).toMatchObject({
      destination: "/coaching/particuliers",
      permanent: true,
    });
    expect(
      byOldSource["/professionnels-etablissements-de-soins/coaching"],
    ).toMatchObject({
      destination: "/coaching/etablissements",
      permanent: true,
    });
    expect(
      byOldSource["/professionnels-etablissements-de-soins/formations-rps-qvct"],
    ).toMatchObject({
      destination: "/formations/prevention-rps-qvct-etablissements-sante",
      permanent: true,
    });
    expect(
      byOldSource[
        "/professionnels-etablissements-de-soins/gapp-groupe-analyse-pratiques-professionnelles"
      ],
    ).toMatchObject({
      destination: "/gapp-analyse-pratiques-professionnelles",
      permanent: true,
    });
  });
});
