import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CoachingHubPage from "../page";

describe("CoachingHubPage — distribue vers les deux publics", () => {
  it("propose un lien vers le coaching particuliers", () => {
    render(<CoachingHubPage />);
    expect(
      screen.getByRole("link", { name: /particuliers/i })
    ).toHaveAttribute("href", "/coaching/particuliers");
  });

  it("propose un lien vers le coaching établissements", () => {
    render(<CoachingHubPage />);
    expect(
      screen.getByRole("link", { name: /établissement/i })
    ).toHaveAttribute("href", "/coaching/etablissements");
  });
});
