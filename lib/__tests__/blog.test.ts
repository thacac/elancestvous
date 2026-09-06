import path from "node:path";

import { describe, expect, it } from "vitest";

import { getAllPostsMeta, getPostBySlug, getPostSlugs, parseDraftContent } from "../blog";

const FIXTURES = path.join(__dirname, "fixtures", "blog");
const VALID = path.join(FIXTURES, "valid");

describe("getPostSlugs", () => {
  it("lists the frontmatter slugs of every markdown file in the directory", () => {
    const slugs = getPostSlugs(VALID);
    expect([...slugs].sort()).toEqual(["post-deux", "post-un"]);
  });
});

describe("getAllPostsMeta", () => {
  it("sorts posts by publishedAt, most recent first", () => {
    const posts = getAllPostsMeta(VALID);
    expect(posts.map((p) => p.slug)).toEqual(["post-deux", "post-un"]);
  });

  it("includes a computed reading time", () => {
    const posts = getAllPostsMeta(VALID);
    expect(posts[0].readingTime).toMatch(/min/);
  });

  it("throws a descriptive error when frontmatter is invalid", () => {
    expect(() =>
      getAllPostsMeta(path.join(FIXTURES, "invalid-frontmatter"))
    ).toThrow(/bad\.md/);
  });

  it("throws when two files declare the same slug", () => {
    expect(() =>
      getAllPostsMeta(path.join(FIXTURES, "duplicate-slug"))
    ).toThrow(/same-slug/);
  });
});

describe("getPostBySlug", () => {
  it("returns the full post with rendered HTML", async () => {
    const post = await getPostBySlug("post-un", VALID);
    expect(post.title).toBe("Premier article de test");
    expect(post.html).toContain("<strong>paragraphe</strong>");
  });

  it("rejects for an unknown slug", async () => {
    await expect(getPostBySlug("inexistant", VALID)).rejects.toThrow();
  });

  it("strips scripts, iframes, inline event handlers and javascript: links from AI-generated markdown", async () => {
    const post = await getPostBySlug("xss", path.join(FIXTURES, "malicious"));
    expect(post.html).not.toContain("<script");
    expect(post.html).not.toContain("<iframe");
    expect(post.html).not.toMatch(/on\w+\s*=/i);
    expect(post.html).not.toContain("javascript:");
    expect(post.html).toContain("Un paragraphe normal.");
  });
});

describe("parseDraftContent", () => {
  const draftWithoutImage = `---
title: "Brouillon sans image"
slug: "brouillon-sans-image"
description: "Description"
excerpt: "Extrait"
publishedAt: "2026-01-01"
tags: []
---
Corps du brouillon.
`;

  it("accepts a draft with no coverImage/coverImageAlt (bypass génération d'image)", () => {
    const { frontmatter, content } = parseDraftContent(draftWithoutImage, "test");

    expect(frontmatter.title).toBe("Brouillon sans image");
    expect(frontmatter.coverImage).toBeUndefined();
    expect(content).toContain("Corps du brouillon.");
  });

  it("still rejects a draft missing a required field like title", () => {
    const invalid = draftWithoutImage.replace('title: "Brouillon sans image"\n', "");
    expect(() => parseDraftContent(invalid, "test")).toThrow(/title/);
  });

  it("rejects coverImage present without coverImageAlt (or vice versa)", () => {
    const withImageOnly = draftWithoutImage.replace(
      "tags: []",
      'coverImage: "/blog/brouillon-sans-image/cover.jpg"\ntags: []'
    );
    expect(() => parseDraftContent(withImageOnly, "test")).toThrow(/coverImage/);
  });

  it("accepts a draft with both coverImage and coverImageAlt", () => {
    const withImage = draftWithoutImage.replace(
      "tags: []",
      'coverImage: "/blog/brouillon-sans-image/cover.jpg"\ncoverImageAlt: "Illustration"\ntags: []'
    );
    const { frontmatter } = parseDraftContent(withImage, "test");
    expect(frontmatter.coverImage).toBe("/blog/brouillon-sans-image/cover.jpg");
  });
});
