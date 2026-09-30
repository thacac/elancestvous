import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});

// jsdom n'implémente pas ResizeObserver — nécessaire pour tout composant
// Radix UI (ex. RadioGroup) qui l'utilise en interne pour se dimensionner.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverStub;
