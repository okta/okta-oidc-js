const tokens = require('../tokens');
const env = require('../env');
const jwt = env.jwt;
const util = require('../util');

describe('using jwt operations end-to-end', () => {
  it('should allow generating, signing and verifying using RS256', () => {
    return jwt.generateKey({
      alg: 'RS256'
    })
    .then(res => {

      // bulletproof
      return jwt.sign({
        claims: tokens.standardClaimsSet,
        jwk: res.privateKey
      })
      .then(signedJwt => {
        return jwt.verify({
          token: signedJwt,
          jwk: res.publicKey
        })
      });
    })
    .then(res => expect(res).toEqual(tokens.standardClaimsSet));
  });

  it('should work with an existing jwt and key', () => {
    const knownJWT = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IlU1UjhjSGJHdzQ0NVFicTh6Vk8xUGNDcFhMOHlHNkljb3ZWYTNsYUNveE0ifQ.eyJzdWIiOiIwMHUxcGNsYTVxWUlSRURMV0NRViIsIm5hbWUiOiJTYW1sIEphY2tzb24iLCJnaXZlbl9uYW1lIjoiU2FtbCIsImZhbWlseV9uYW1lIjoiSmFja3NvbiIsInVwZGF0ZWRfYXQiOjE0NDYxNTM0MDEsImVtYWlsIjoic2FtbGphY2tzb25Ab2t0YS5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwidmVyIjoxLCJpc3MiOiJodHRwczovL2F1dGgtanMtdGVzdC5va3RhLmNvbSIsImxvZ2luIjoiYWRtaW5Ab2t0YS5jb20iLCJub25jZSI6ImFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWEiLCJhdWQiOiJOUFNmT2tINWVaclR5OFBNRGx2eCIsImlhdCI6MTQ0OTY5NjMzMCwiZXhwIjoxNDQ5Njk5OTMwLCJhbXIiOlsia2JhIiwibWZhIiwicHdkIl0sImp0aSI6IlRSWlQ3UkNpU3ltVHM1VzdSeWgzIiwiYXV0aF90aW1lIjoxNDQ5Njk2MzMwfQ.tdspicRE-0IrFKwjCT2Uo2gExQyTAftcp4cuA3iIF6_uYiqQ9Q4SZHCjMbuWdXrUSM-_UkDpD6sbG_ZRcdZQJ7geeIEjKpV4x792iiP_f1H-HLbAMIDWynp5FR4QQO1Q4ndNOwIsrUqf06vYazz9ildQde2uOTwcaUCsz2M0lSU';
    const knownKey = {
      alg: 'RS256',
      kty: 'RSA',
      n: '3ZWrUY0Y6IKN1qI4BhxR2C7oHVFgGPYkd38uGq1jQNSqEvJFcN93CYm16_G78FAFKWqwsJb3Wx-nbxDn6LtP4AhULB1H0K0g7_jLklDAHvI8' +
        'yhOKlvoyvsUFPWtNxlJyh5JJXvkNKV_4Oo12e69f8QCuQ6NpEPl-cSvXIqUYBCs',
      e: 'AQAB',
      use: 'sig',
      kid: 'U5R8cHbGw445Qbq8zVO1PcCpXL8yG6IcovVa3laCoxM'
    };

    return jwt.verify({
      token: knownJWT,
      jwk: knownKey
    })
    .then(res => expect(res).toEqual({}))
  });
});
