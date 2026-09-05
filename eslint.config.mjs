import path from "node:path";
import { fileURLToPath } from "node:url";
import nextTs from "eslint-config-next/typescript";
import nextVitals from "eslint-config-next/core-web-vitals";
import importPlugin from "eslint-plugin-import"; // Import the plugin

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const eslintConfig = [
  {
    ignores: [".yarn/**"],
  },
  ...nextVitals,
  ...nextTs,

  // 2. Import Plugin Configuration
  {
    files: ["**/*.{js,ts,jsx,tsx}"],
    plugins: {
      import: importPlugin,
    },
    settings: {
      // This tells eslint-plugin-import to use the TypeScript resolver
      "import/resolver": {
        typescript: {
          // Tell the resolver where to find your tsconfig.json
          project: path.join(__dirname, "./tsconfig.json"),
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx']
        }
      },
    },
    rules: {
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { ignoreRestSiblings: true }],
      // Enable the rule to check for unresolved imports
      "import/no-unresolved": "error",
      "react/no-unescaped-entities": "warn",
      
      // OPTIONAL: Configure import sorting to keep absolute imports grouped
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          // This ensures your '@' imports are treated as 'internal' modules
          pathGroups: [
            {
              pattern: '@/**', 
              group: 'internal', 
              position: 'after',
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;