module.exports = {
  env: {
    browser: true,
    es2021: true,
    jasmine: true
  },
  extends: [
    'standard',
    'plugin:jsdoc/recommended'
  ],
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    'jsdoc'
  ],
  rules: {
  }
}
