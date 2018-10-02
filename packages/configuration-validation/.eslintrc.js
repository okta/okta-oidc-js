// https://eslint.org/docs/user-guide/configuring

module.exports = {
  extends: [ 'eslint:recommended' ],
  parser: "babel-eslint",
  env: {
    node: true,
    es6: true,
    jest: true
  }
};
