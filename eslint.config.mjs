import path from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import importPlugin from "eslint-plugin-import"; // Import the plugin

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // 1. Next.js Recommended Config (using FlatCompat)
  // This extends your configuration with Next.js's base rules
  ...compat.extends("next/core-web-vitals", "next/typescript"),

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
      // Enable the rule to check for unresolved imports
      "import/no-unresolved": "error",
      
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