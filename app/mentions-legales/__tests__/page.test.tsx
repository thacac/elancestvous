import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import MentionsLegales from "../page";

describe("MentionsLegales — espacement sous la navbar (mobile)", () => {
  it("réduit le padding-top mobile plutôt que le padding desktop fixe (pt-20)", () => {
    const { container } = render(<MentionsLegales />);
    const section = container.querySelector("#mentions-legales")!;

    expect(section.className).toContain("pt-6");
    expect(section.className).toContain("sm:pt-20");
  });
});
