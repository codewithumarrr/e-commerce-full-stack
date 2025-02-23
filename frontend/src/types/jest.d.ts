import "@testing-library/jest-dom";
import { expect } from "@jest/globals";

declare global {
  const jest: typeof import("@jest/globals").jest;
  const describe: typeof import("@jest/globals").describe;
  const it: typeof import("@jest/globals").it;
  const test: typeof import("@jest/globals").test;
  const expect: typeof import("@jest/globals").expect;
  const beforeAll: typeof import("@jest/globals").beforeAll;
  const beforeEach: typeof import("@jest/globals").beforeEach;
  const afterAll: typeof import("@jest/globals").afterAll;
  const afterEach: typeof import("@jest/globals").afterEach;

  interface Window {
    IntersectionObserver: {
      new (
        callback: IntersectionObserverCallback,
        options?: IntersectionObserverInit
      ): {
        observe: (target: Element) => void;
        unobserve: (target: Element) => void;
        disconnect: () => void;
      };
    };
    matchMedia: (query: string) => {
      matches: boolean;
      media: string;
      onchange: null;
      addListener: (listener: () => void) => void;
      removeListener: (listener: () => void) => void;
      addEventListener: (type: string, listener: () => void) => void;
      removeEventListener: (type: string, listener: () => void) => void;
      dispatchEvent: (event: Event) => boolean;
    };
    scrollTo: (x: number, y: number) => void;
  }
}
