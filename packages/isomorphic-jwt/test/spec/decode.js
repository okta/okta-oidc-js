const tokens = require('../tokens');
const jwt = require('../env').jwt;

describe('jwt.decode', () => {
  it('should decode unicode', () => {
    expect(jwt.decode(tokens.unicodeToken)).toEqual(tokens.unicodeClaimsSet);
  });

  it('should decode utf8', () => {
    expect(jwt.decode(tokens.standardToken)).toEqual(tokens.standardClaimsSet);
  });

  it('should decode an unsecured jwt', () => {
    expect(jwt.decode(tokens.unsecuredJWT)).toEqual(tokens.standardClaimsSet);
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
      .toThrowError('The jwt must have a header, claims set and signature');
  });

  it('should throw an error if the header is malformed', () => {
    expect(() => jwt.decode(tokens.malformedHeader))
      .toThrowError('The jwt header is malformed');
  });

  it('should throw an error if the claims set is malformed', () => {
    expect(() => jwt.decode(tokens.malformedClaimsSet))
      .toThrowError('The jwt claims set is malformed');
  });
});
