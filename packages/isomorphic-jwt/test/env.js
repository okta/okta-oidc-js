const env = {
  jwt: null,
  name: null,
  supportedAlgorithms: new Set(),
  supports(algo) {
    if (env.supportedAlgorithms.includes(algo)) {
      return {
        it,
        describe
      };
    }
    return {
      it: (description) => {
        it(description, () => pending(`${env.name} does not support ${algo}`)); 
      },
      describe: (description) => {
        it(description, () => pending(`${env.name} does not support ${algo}`));
      }
    };
  }
};

module.exports = env;
