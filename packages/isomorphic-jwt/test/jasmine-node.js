const Jasmine = require('jasmine');
const path = require('path');
const SpecReporter = require('jasmine-spec-reporter').SpecReporter;

const env = require('./env');
env.name = 'node';
env.jwt = require('../src/node');
env.supportedAlgorithms = new Set([
  'RS256',
  // 'RS384',
  // 'RS512',
  'HS256',
  'HS384',
  'HS512'
]);

const jasmine = new Jasmine({
  // Jasmine uses the wrong base directory if it's hoisted with lerna
  projectBaseDir: path.resolve(__dirname, '..')
});

jasmine.loadConfig({
  spec_dir: 'test',
  spec_files: [
    'spec/**/*.js'
  ]
});

jasmine.env.clearReporters();

jasmine.addReporter(new SpecReporter({
  spec: {
    displayPending: true
  }
}));

jasmine.execute();
