module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    'airbnb-base',
  ],
  rules: {
    // Files are CRLF on disk (core.autocrlf) - the style rule is meaningless here
    'linebreak-style': 'off',
    // Codebase convention is double quotes (templates + migrated .vue files)
    // Disabled: prettier owns quote formatting (singleQuote: false); it may use
    // single quotes when a string contains double quotes to minimize escaping
    quotes: 'off',
    // Disabled: prettier owns indentation (may differ from eslint's indent rule
    // for chained calls / ternaries)
    indent: 'off',
    // Codebase relies on hoisted function declarations and cross-referencing computeds
    'no-use-before-define': 'off',
    // Style preferences below conflict with the codebase's established formatting
    'operator-linebreak': 'off',
    'implicit-arrow-linebreak': 'off',
    'function-paren-newline': 'off',
    'object-curly-newline': 'off',
    curly: 'off',
    'nonblock-statement-body-position': 'off',
    'arrow-body-style': 'off',
    'no-confusing-arrow': 'off',
    'max-len': 'off',
    'import/order': 'off',
    'vue/multi-word-component-names': 'off',
    'no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_',
      },
    ],
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'arrow-parens': 0,
    'no-else-return': 0,
  },
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  overrides: [
    {
      files: ['services/**/*.js'],
      rules: {
        'no-console': 'off',
      },
    },
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      rules: {
        // TS parser cannot see lib.dom globals (EventListener etc.); vue-tsc covers real errors
        'no-undef': 'off',
        'import/no-unresolved': 'off',
        'import/extensions': 'off',
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      },
    },
  ],
};
