import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "node_modules", "functions/lib", "functions/node_modules"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["functions/scripts/**"],
    languageOptions: { globals: { process: "readonly", console: "readonly" } },
  },
);
