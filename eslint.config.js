import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import prettier from "eslint-config-prettier";

// Flat config (ESLint 9). Scoped to the backend; the Next.js app under web/ has its
// own toolchain and is linted there. Type-aware linting is intentionally off to keep
// `eslint .` fast and config-light — `tsc --noEmit` is the type gate.
export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "web/**",
      "public/**",
      "docs/**",
      "**/*.d.ts",
      "src/agent/kb/docs.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      // The codebase deliberately uses `any` for opaque external API payloads.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-empty": ["warn", { allowEmptyCatch: true }],
    },
  },
  prettier,
);
