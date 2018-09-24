const { resolve } = require('path');
const { execSync } = require('child_process');

exports.command = 'jest';
exports.desc = 'Runs jest';
exports.builder = {
  jestHelp: {
    description: 'Run this to see the Jest CLI options or visit here: https://facebook.github.io/jest/docs/en/cli.html',
    alias: 'h',
    default: false
  }
};

exports.handler = (argv) => {
  const packageDir = process.env.PACKAGE_DIR = process.cwd();
  const jestBin = resolve(__dirname, '../node_modules/.bin/jest');
  const config = resolve(__dirname, '../jest.conf.js');

  const options = {
    cwd: packageDir,
    stdio: 'inherit'
  };

  const jestArgs = process.argv.slice(3).join(' ');
  const jestOptions = Object.assign({
    cwd: packageDir,
  }, options);

  const helpArg = argv.jestHelp ? '--help' : '';
  try {
    execSync(`${jestBin} --config ${config} ${helpArg} ${jestArgs}`, jestOptions);
  } catch (e) {
    console.warn('Tests failed!');
  }
};
