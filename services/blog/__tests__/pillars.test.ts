import { describe, expect, it } from "vitest";

import { PILLARS, pickNextPillar, shouldInjectLocalAngle, type PillarId } from "../pillars";

describe("pickNextPillar", () => {
  it("never picks the same pillar as the one immediately preceding it", () => {
    const history: PillarId[] = [];
    for (let i = 0; i < 50; i++) {
      const next = pickNextPillar(history);
      if (history.length > 0) {
        expect(next.id).not.toBe(history[history.length - 1]);
      }
      history.push(next.id);
    }
  });

  it("respects the relative weights over a long run (within a reasonable tolerance)", () => {
    const history: PillarId[] = [];
    const rounds = 1100;
    for (let i = 0; i < rounds; i++) {
      const next = pickNextPillar(history);
      history.push(next.id);
    }

    const totalWeight = PILLARS.reduce((sum, p) => sum + p.weight, 0);
    const counts = new Map<PillarId, number>(PILLARS.map((p) => [p.id, 0]));
    for (const id of history) counts.set(id, counts.get(id)! + 1);

    for (const pillar of PILLARS) {
      const expectedShare = pillar.weight / totalWeight;
      const actualShare = counts.get(pillar.id)! / rounds;
      expect(Math.abs(actualShare - expectedShare)).toBeLessThan(0.02);
    }
  });

  it("is deterministic on an empty history (picks the highest-weight pillar first)", () => {
    const next = pickNextPillar([]);
    expect(next.id).toBe("C");
  });
});

describe("shouldInjectLocalAngle", () => {
  it("returns true when there is no history yet", () => {
    expect(shouldInjectLocalAngle([])).toBe(true);
  });

  it("returns true when none of the last 4 articles carried the local angle", () => {
    expect(shouldInjectLocalAngle([true, false, false, false, false])).toBe(true);
  });

  it("returns false when the local angle appears within the last 4 articles", () => {
    expect(shouldInjectLocalAngle([false, false, false, true])).toBe(false);
  });

  it("only looks at the last 4 entries, ignoring older ones", () => {
    expect(shouldInjectLocalAngle([true, false, false, false, false, false])).toBe(true);
  });
});
