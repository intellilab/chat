// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
  ],
  env: {
    node: true,
    es6: true,
  },
  rules: {
    'node/no-unpublished-require': ['error', {
      allowModules: ['electron', 'electron-builder']
    }],
    'no-process-exit': 'off',
    'require-atomic-updates': 'off',
    'no-constant-condition': 'off',
  },
}
