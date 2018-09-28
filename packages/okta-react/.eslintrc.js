// https://eslint.org/docs/user-guide/configuring

module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended'
  ],
  parser: "babel-eslint",
  plugins: [
    "react"
  ],
  env: {
    browser: true,
    es6: true
  },
  rules: {
    'react/prop-types': 0
  },
  settings: {
    react: {
      version: '15.0',
    }
  }
};
