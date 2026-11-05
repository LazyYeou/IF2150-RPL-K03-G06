import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // MVC: view tidak boleh menyentuh model/DB langsung (lewat controller/API)
    files: ["views/**/*.{ts,tsx}", "app/**/page.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/models/*", "**/lib/db"],
              message:
                "View dilarang impor models/ atau lib/db; gunakan controller atau API.",
            },
          ],
        },
      ],
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "playwright-report/**",
      "test-results/**",
    ],
  },
];

export default eslintConfig;
