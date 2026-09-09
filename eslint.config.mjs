import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Standard convention: names prefixed with `_` mark intentionally-unused
      // parameters (e.g. required-by-caller-but-unused-inside props/args).
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored Swagger UI dist bundle, served as a static asset by
    // `/api-docs` (see `src/app/api-docs/page.tsx`). It is third-party build
    // output, not project source — linting it drowned the real findings under
    // ~2,800 warnings from minified code.
    "public/**",
  ]),
]);

export default eslintConfig;
