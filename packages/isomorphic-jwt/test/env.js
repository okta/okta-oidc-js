const EventEmitter = require('events');

const env = {
  jwt: null,
  name: null,
  supports(query) {
    const emitter = new EventEmitter();
    let supported = null;

    env.jwt.supports(query)
    .then(isSupported => {
      supported = isSupported;
      emitter.emit('supportFound');
    });

    return {
      it: (description, cb) => {
        it(description, () => {
          return new Promise(resolve => {
            if (supported !== null) return resolve();
            emitter.on('supportFound', () => resolve());
          })
          .then(() => {
            if (supported) return cb();
            pending();
            //pending(`${env.name} does not support ${JSON.stringify(query)}`);
          });
        });
      },
      describe: (description, cb) => {
        emitter.on('supported', () => describe(description, cb));
        emitter.on('unsupported', () => {
          it(description, () => pending(`${env.name} does not support ${JSON.stringify(query)}`)); 
        });
      }
    };
  }
};

module.exports = env;
