import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import JsonLdScript from "../JsonLdScript";

describe("JsonLdScript", () => {
  it("renders a single application/ld+json script tag with the serialized data", () => {
    const { container } = render(
      <JsonLdScript data={{ "@type": "Thing", name: "Test" }} />,
    );
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    expect(JSON.parse(script!.innerHTML)).toEqual({
      "@type": "Thing",
      name: "Test",
    });
  });
});
