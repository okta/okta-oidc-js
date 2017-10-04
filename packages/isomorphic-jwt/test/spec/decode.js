const jwt = require('../../dist/index');
const errors = require('../../src/errors');
const tokens = require('../tokens');

describe('jwt.decode', () => {
  it('should decode unicode', () => {
    expect(jwt.decode(tokens.unicodeToken)).toEqual(tokens.unicodeClaims);
  });

  it('should decode utf8', () => {
    expect(jwt.decode(tokens.standardToken)).toEqual(tokens.standardPayload);
  });

  it('should throw an error if no jwt is passed', () => {
    expect(() => jwt.decode())
      .toThrowError(TypeError, 'A jwt must be provided as a string');
  });

  it('should throw an error if the jwt is not a string', () => {
    expect(() => jwt.decode(42))
      .toThrowError(TypeError, 'A jwt must be provided as a string');
  });

  it('should throw an error if the jwt does not have 3 parts', () => {
    expect(() => jwt.decode('part1.part2'))
      .toThrowError('The jwt must have a header, payload and signature');
  });

  it('should throw an error if the header is malformed', () => {
    expect(() => jwt.decode(tokens.malformedHeader))
      .toThrowError('The jwt header is malformed');
  });

  it('should throw an error if the payload is malformed', () => {
    expect(() => jwt.decode(tokens.malformedPayload))
      .toThrowError('The jwt payload is malformed');
  });
});
