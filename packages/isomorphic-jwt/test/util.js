module.exports = {
  expectPromiseError(promise, errorMessage) {
    let error = {};
    return promise
      .catch(err => error = err)
      .then(() => {
        if (typeof errorMessage === 'string') {
          expect(error.message).toEqual(errorMessage);
        } else {
          expect(error.message).toMatch(errorMessage);
        }
      });
  }
}
