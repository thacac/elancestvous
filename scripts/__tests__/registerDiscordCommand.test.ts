import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { buildCommandDefinitions } from "../registerDiscordCommand";

describe("buildCommandDefinitions", () => {
  it("registers both /blog-sujet and /blog-file", () => {
    const names = buildCommandDefinitions().map((command) => command.name);

    expect(names).toEqual(["blog-sujet", "blog-file"]);
  });

  it("scopes every command to a server (integration_types/contexts = [0]) rather than relying on the Discord portal's default install type", () => {
    for (const command of buildCommandDefinitions()) {
      expect(command.integration_types).toEqual([0]);
      expect(command.contexts).toEqual([0]);
    }
  });

  it("keeps the optional STRING option on /blog-file for removing a queue entry by id", () => {
    const blogFile = buildCommandDefinitions().find((c) => c.name === "blog-file");

    expect(blogFile?.options).toEqual([
      expect.objectContaining({ name: "supprimer", type: 3, required: false }),
    ]);
  });

  it("guards main() behind an entry-point check, so importing this module never calls Discord's API or process.exit()", () => {
    const source = readFileSync(
      resolve(process.cwd(), "scripts/registerDiscordCommand.ts"),
      "utf8"
    );

    expect(source).toContain("if (process.argv[1] === fileURLToPath(import.meta.url))");
  });
});
