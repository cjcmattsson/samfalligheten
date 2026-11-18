import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "dist-demo", "node_modules", "functions/lib", "functions/node_modules"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["functions/scripts/**", "scripts/**"],
    languageOptions: { globals: { process: "readonly", console: "readonly" } },
  },
);
