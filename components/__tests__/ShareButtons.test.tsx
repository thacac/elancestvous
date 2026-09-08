import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import ShareButtons from "../ShareButtons";

const url = "https://elancestvous.fr/blog/gapp-supervision-debriefing-equipe-de-soin";
const title = "GAPP, supervision, débriefing : comment s'y retrouver";

describe("ShareButtons", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("links to LinkedIn's share dialog with the article URL", () => {
    render(<ShareButtons url={url} title={title} />);

    const link = screen.getByRole("link", { name: /linkedin/i });
    expect(link).toHaveAttribute(
      "href",
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    );
  });

  it("links to Facebook's share dialog with the article URL", () => {
    render(<ShareButtons url={url} title={title} />);

    const link = screen.getByRole("link", { name: /facebook/i });
    expect(link).toHaveAttribute(
      "href",
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    );
  });

  it("links to WhatsApp with the article title and URL", () => {
    render(<ShareButtons url={url} title={title} />);

    const link = screen.getByRole("link", { name: /whatsapp/i });
    expect(link).toHaveAttribute(
      "href",
      `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`
    );
  });

  it("copies the article URL to the clipboard and confirms it to the user", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<ShareButtons url={url} title={title} />);

    fireEvent.click(screen.getByRole("button", { name: /copier le lien/i }));

    expect(writeText).toHaveBeenCalledWith(url);
    expect(await screen.findByText(/lien copié/i)).toBeInTheDocument();
  });

  it("fails silently (no confirmation, no unhandled rejection) when the clipboard write is rejected", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("clipboard indisponible"));
    Object.assign(navigator, { clipboard: { writeText } });
    render(<ShareButtons url={url} title={title} />);

    fireEvent.click(screen.getByRole("button", { name: /copier le lien/i }));
    await vi.waitFor(() => expect(writeText).toHaveBeenCalled());

    expect(screen.queryByText(/lien copié/i)).not.toBeInTheDocument();
  });

  it("clears the pending confirmation timeout on unmount (pas de mise à jour d'état sur un composant démonté)", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");
    const { unmount } = render(<ShareButtons url={url} title={title} />);

    fireEvent.click(screen.getByRole("button", { name: /copier le lien/i }));
    await screen.findByText(/lien copié/i);
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
