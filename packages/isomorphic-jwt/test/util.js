module.exports = {
  expectPromiseError(promise, errorMessage) {
    let error = {};
    return promise
      .catch(err => error = err)
      .then(() => expect(error.message).toEqual(errorMessage));
  }
}
