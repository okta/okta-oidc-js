const { execFile } = require('child_process');
const path = require('path');
const waitOn = require('wait-on');
const constants = require('./constants');

const util = module.exports;

util.startServer = () => {
  const serverLocation = path.resolve(__dirname, '../harness/server.js');
  return new Promise((resolve, reject) => {
    const child = execFile('node', [serverLocation], (err, stdout, stderr) => {
      if (err) {
        return reject(err);
      }
    });

    waitOn({
      resources: [
        `tcp:localhost:${constants.PORT}`
      ]
    }, err => {
      if (err) {
        return reject(err);
      }
      resolve(child);
    });
  });
};

util.stopServer = server => {
  return new Promise((resolve, reject) => {
    server.once('error', err => {
      reject(err);
    });

    server.once('close', (code, signal) => {
      resolve();
    });

    server.kill('SIGTERM');
  });
};

util.ensureTrailingSlash = str => {
  if (str.slice(-1) === '/') {
    return str;
  }
  return `${str}/`;
};
