// const prettierConfig = {
//   trailingComma: 'es5',
//   tabWidth: 2,
//   semi: false,
//   singleQuote: true,
// }
// module.exports = {
//   root: true,
//   extends: ['tonyfromundefined'],
//   rules: {
//     'prettier/prettier': ['error', prettierConfig, { usePrettierrc: false }],
//     semi: ['error', 'never'],
//     // '@typescript-eslint/semi': ['error', 'never'],
//   },
// }

module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: [
    'dist',
    '.eslintrc.cjs',
    'node_modules',
    'build',
    'coverage',
    '*.config.js',
    '*.config.ts',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    cacheDirectory: true,
  },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
  cache: true,
  cacheLocation: '.eslintcache',
  settings: {
    'import/cache': {
      lifetime: 'Infinity',
    },
  },
}
