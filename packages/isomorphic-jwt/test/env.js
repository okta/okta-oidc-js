const env = {
  jwt: null,
  name: null,
  supports(query) {
    return {
      it: (description, cb) => {
        it(description, () => {
          return env.jwt.supports(query)
          .then(isSupported => {
            if (isSupported) return cb();
            console.log(`${description} - ${env.name} does not support ${JSON.stringify(query)}`);
          });
        });
      }
    };
  }
};

module.exports = env;
