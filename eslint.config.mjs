// eslint.config.mjs
import js from "@eslint/js";
import next from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";

export default [
  // ✅ 生成物は lint 対象外（Prisma / wasm / build）
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "generated/**", // Prisma output
      "**/*.wasm",
      "**/*wasm-base64.js",
    ],
  },

  // JS ルール（eslint.config.mjs / postcss.config.mjs などはここで普通に扱う）
  js.configs.recommended,

  // ✅ TypeScript (typed) は TS/TSX のみに限定
  ...tseslint.configs.recommendedTypeChecked.map((c) => ({
    ...c,
    files: ["**/*.ts", "**/*.tsx"],
  })),
  ...tseslint.configs.stylisticTypeChecked.map((c) => ({
    ...c,
    files: ["**/*.ts", "**/*.tsx"],
  })),

  // ✅ typed lint の project 設定も TS/TSX のみに限定
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Next.js
  {
    plugins: { "@next/next": next },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs["core-web-vitals"].rules,
    },
  },
];
