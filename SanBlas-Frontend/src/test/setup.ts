import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// React Testing Library no limpia el DOM entre tests por su cuenta en vitest
afterEach(() => {
  cleanup();
});
