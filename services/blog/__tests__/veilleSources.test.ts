import { describe, expect, it } from "vitest";

import { parseVeilleSources } from "../veilleSources";

describe("parseVeilleSources", () => {
  it("returns an empty array when the env var is undefined", () => {
    expect(parseVeilleSources(undefined)).toEqual([]);
  });

  it("returns an empty array when the env var is empty", () => {
    expect(parseVeilleSources("")).toEqual([]);
  });

  it("splits a comma-separated list into an array, preserving order", () => {
    expect(
      parseVeilleSources(
        "https://www.service-public.fr/rss.xml,https://www.legifrance.gouv.fr/rss.xml"
      )
    ).toEqual([
      "https://www.service-public.fr/rss.xml",
      "https://www.legifrance.gouv.fr/rss.xml",
    ]);
  });

  it("trims surrounding whitespace around each source", () => {
    expect(parseVeilleSources(" https://a.example/rss.xml , https://b.example/rss.xml ")).toEqual(
      ["https://a.example/rss.xml", "https://b.example/rss.xml"]
    );
  });

  it("drops empty entries caused by trailing/double commas", () => {
    expect(parseVeilleSources("https://a.example/rss.xml,,")).toEqual([
      "https://a.example/rss.xml",
    ]);
  });

  it("returns a single-element array for a single source without commas", () => {
    expect(parseVeilleSources("https://a.example/rss.xml")).toEqual([
      "https://a.example/rss.xml",
    ]);
  });
});
