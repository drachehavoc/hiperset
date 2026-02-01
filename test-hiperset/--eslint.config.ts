import tseslint from "typescript-eslint"
import Hiperset from "@hiperset/eslint"

export default tseslint.config({
  //...js.configs.recommended,
  //...tseslint.configs.recommended,
  files: ["**/*{.ts,.tsx,.js,.jsx,mjs,cjs}"],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      // project: "./tsconfig.json",
    },
  },
  plugins: { ...Hiperset.plugin },
  rules: { "hiperset/plugin": "warn" },
})