module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:vue/essential',
    'airbnb-base',
  ],
  rules: {
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'arrow-parens': 0,
    'no-else-return': 0,
  },
  parserOptions: {
    parser: 'babel-eslint',
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
  ],
};
