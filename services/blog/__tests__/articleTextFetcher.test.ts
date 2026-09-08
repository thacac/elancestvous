import { describe, expect, it, vi } from "vitest";

import { fetchArticleText } from "../articleTextFetcher";

function makeFetch(body: string, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status < 400,
    status,
    text: vi.fn().mockResolvedValue(body),
  });
}

describe("fetchArticleText", () => {
  it("strips tags/scripts/styles and collapses whitespace into plain text", async () => {
    const fetchImpl = makeFetch(`
      <html>
        <head><style>.x{color:red}</style></head>
        <body>
          <script>trackSomething();</script>
          <nav>Accueil</nav>
          <article>
            <h1>Titre de l'article</h1>
            <p>Premier   paragraphe avec   des espaces.</p>
            <p>Second paragraphe.</p>
          </article>
        </body>
      </html>
    `);

    const text = await fetchArticleText("https://source.example/actu-1", fetchImpl);

    expect(text).not.toBeNull();
    expect(text).not.toMatch(/trackSomething|color:red/);
    expect(text).toContain("Titre de l'article");
    expect(text).toContain("Premier paragraphe avec des espaces.");
    expect(text).toContain("Second paragraphe.");
  });

  it("decodes common HTML entities", async () => {
    const fetchImpl = makeFetch("<p>Formation RPS &amp; QVCT &mdash; d&#39;ici &lt;2026&gt;</p>");

    const text = await fetchArticleText("https://source.example/actu-2", fetchImpl);

    expect(text).toBe("Formation RPS & QVCT — d'ici <2026>");
  });

  it("truncates to a bounded length so a huge page can't blow up the prompt", async () => {
    const fetchImpl = makeFetch(`<p>${"A".repeat(50_000)}</p>`);

    const text = await fetchArticleText("https://source.example/actu-3", fetchImpl);

    expect(text!.length).toBeLessThanOrEqual(10_000);
  });

  it("returns null when the page has no extractable text", async () => {
    const fetchImpl = makeFetch("<html><body><script>onlyScript();</script></body></html>");

    const text = await fetchArticleText("https://source.example/actu-4", fetchImpl);

    expect(text).toBeNull();
  });

  it("returns null (never throws) when the fetch fails", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 403, text: vi.fn() });

    const text = await fetchArticleText("https://source.example/actu-5", fetchImpl);

    expect(text).toBeNull();
  });

  it("returns null (never throws) when the network call rejects or times out", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("network down"));

    const text = await fetchArticleText("https://source.example/actu-6", fetchImpl);

    expect(text).toBeNull();
  });

  it("returns null (never throws) for an unparseable URL", async () => {
    const fetchImpl = makeFetch("<p>texte</p>");

    const text = await fetchArticleText("not a url", fetchImpl);

    expect(text).toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  describe("SSRF guard (an unmoderated RSS/Atom feed controls this URL, #66)", () => {
    it.each([
      ["a non-http(s) scheme", "file:///etc/passwd"],
      ["loopback (IPv4)", "http://127.0.0.1/admin"],
      ["loopback (IPv6)", "http://[::1]/admin"],
      ["localhost", "http://localhost:8080/admin"],
      ["link-local / cloud metadata", "http://169.254.169.254/latest/meta-data/"],
      ["private range 10.0.0.0/8", "http://10.0.0.5/internal"],
      ["private range 172.16.0.0/12", "http://172.16.0.1/internal"],
      ["private range 192.168.0.0/16", "http://192.168.1.1/internal"],
      ["unspecified address", "http://0.0.0.0/internal"],
    ])("never fetches %s (%s)", async (_label, url) => {
      const fetchImpl = makeFetch("<p>texte</p>");

      const text = await fetchArticleText(url, fetchImpl);

      expect(text).toBeNull();
      expect(fetchImpl).not.toHaveBeenCalled();
    });

    it("still fetches an ordinary public https URL", async () => {
      const fetchImpl = makeFetch("<p>texte public</p>");

      const text = await fetchArticleText("https://source.example/actu-1", fetchImpl);

      expect(text).toBe("texte public");
      expect(fetchImpl).toHaveBeenCalledTimes(1);
    });
  });
});
