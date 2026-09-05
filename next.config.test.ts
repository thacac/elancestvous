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
