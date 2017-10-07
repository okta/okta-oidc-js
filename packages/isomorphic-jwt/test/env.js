const env = {
  jwt: null,
  name: null,
  supportedAlgorithms: new Set(),
  supports(algo) {
    if (env.supportedAlgorithms.has(algo)) {
      return {
        it,
        describe
      };
    }
    return {
      it: (description) => {
        it(description, () => pending(`${env.name} does not support ${algo}`)); 
      },
      describe: (description, cb) => {
        it(description, () => pending(`${env.name} does not support ${algo}`));
        xdescribe(description, cb);
      }
    };
  }
};

module.exports = env;
