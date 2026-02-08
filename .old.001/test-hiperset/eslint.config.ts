import tseslint from "typescript-eslint"
import { rule } from "@hiperset/eslint"

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
  // plugins: { ...Hiperset.plugin },
  plugins: { 
      'meu-projeto-local': {
        rules: {
          'no-nono-hiperset': rule,
        },
      },
  },
  rules: { 
    'meu-projeto-local/no-nono-hiperset': 'error'
  },
})