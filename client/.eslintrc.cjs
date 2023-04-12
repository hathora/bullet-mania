module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: ["tsconfig.json"],
  },
  plugins: [
    "@typescript-eslint",
    "eslint-plugin-import",
    "prettier",
    "unused-imports",
    "header",
    "react",
    "react-hooks",
  ],
  rules: {
    "@typescript-eslint/no-unnecessary-condition": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { vars: "all", varsIgnorePattern: "^_", args: "after-used", argsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "error",
    "no-shadow": "error",
    "unused-imports/no-unused-vars": [
      "error",
      { vars: "all", varsIgnorePattern: "^_", args: "after-used", argsIgnorePattern: "^_" },
    ],
    "prettier/prettier": ["error", { printWidth: 120 }],
    indent: "off",
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "double"],
    semi: ["error", "always"],
    "import/order": [
      "error",
      {
        groups: ["builtin", "external", "internal", "parent", "sibling", "index", "object", "type"],
        "newlines-between": "always",
        alphabetize: {
          order: "desc",
          caseInsensitive: true,
        },
      },
    ],
    curly: ["error"],
    "arrow-parens": ["error"],
    "arrow-spacing": ["error"],
  },
};
