import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["main.js"],
    languageOptions: {
      sourceType: "script",
      globals: {
        ...globals.browser,
        Vue: "readonly",
        LZString: "readonly",
        lucide: "readonly",
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
          impliedStrict: true,
        },
      },
    },
  },
  pluginJs.configs.all,
  {
    rules: {
      "no-magic-numbers": "off",
      "sort-keys": "off",
      "no-ternary": "off",
      "one-var": "off",
      "max-statements": ["warn", 50],
    },
  },
];
