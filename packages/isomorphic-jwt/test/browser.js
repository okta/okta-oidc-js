const env = require('./env');
env.name = 'browser';
env.jwt = require('../src/browser');

const specContext = require.context('./spec', true, /.*/);
specContext.keys().forEach(specContext);
