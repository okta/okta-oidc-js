const { existsSync } = require('fs');
const { resolve } = require('path');

const packageDir = process.env.PACKAGE_DIR;
const setupFile = resolve(`${packageDir}/test/unit/setup.js`);
const packageJson = require(resolve(`${packageDir}/package.json`));

const config = Object.assign({
  roots: [
    resolve(packageDir)
  ],
  testMatch: [
    '**/test/**/*.spec.js'
  ],
}, packageJson.jest);

// Only a subset of packages have a setupFile
if (existsSync(setupFile)) {
  config.setupFiles = [
    setupFile
  ];
}

module.exports = config;
