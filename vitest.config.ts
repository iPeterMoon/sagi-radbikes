import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  // Vitest trae su propia copia de Vite; el cast evita el choque de tipos entre
  // las dos versiones al compilar el proyecto con `tsc`/`next build`.
  plugins: [tsconfigPaths(), react()] as any,
  test: {
    environment: "node",
    globals: false,
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/setup.ts"],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/app/**/layout.tsx",
        "src/app/**/page.tsx",
        "src/**/*.d.ts",
        "src/types/**",
      ],
    },
  },
});
