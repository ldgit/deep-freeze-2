module.exports = {
  extends: ['airbnb-base', 'prettier'],
  rules: {
    'no-use-before-define': ['error', { functions: false, classes: true }],
  },
  env: {
    jest: true,
    node: true,
  },
};
