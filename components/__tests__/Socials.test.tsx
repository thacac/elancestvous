import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Socials from "../Socials";

describe("Socials", () => {
  it("always renders LinkedIn as a real crawlable link", () => {
    render(<Socials />);
    expect(screen.getByRole("link", { name: /linkedin/i })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/coralie-mathorel-852b44360",
    );
  });
});
