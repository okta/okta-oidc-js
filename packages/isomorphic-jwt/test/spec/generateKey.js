const tokens = require('../tokens');
const env = require('../env');
const jwt = env.jwt;
const util = require('../util');

describe('jwt.generateKey', () => {
  it('should throw an error if an algorithm is unsupported', () => {
    util.expectPromiseError(jwt.generateKey({ alg: 'nonexistant' }),
      `jwt in ${env.name} cannot generate nonexistant keys`);
  });

  describe('RSA algos', () => {
    ['RS256', 'RS384', 'RS512'].map(algo => {
      env.supports({ [algo]: ['generateKey'] })
      .it(`should return a ${algo} key`, () => {
        return jwt.generateKey({
          alg: algo
        })
        .then(res => {
          expect(res.publicKey).toBeDefined();
          expect(res.publicKey.alg).toEqual(algo);
          expect(res.publicKey.e).toEqual('AQAB');
          expect(res.publicKey.ext).toBe(true);
          expect(res.publicKey.key_ops).toEqual(['verify']); // WebCrypto in node returns ['verify']
          expect(res.publicKey.kty).toEqual('RSA');
          expect(res.publicKey.n).toBeDefined();
    
          expect(res.privateKey).toBeDefined();
          expect(res.privateKey.alg).toEqual(algo);
          expect(res.privateKey.e).toEqual('AQAB');
          expect(res.privateKey.ext).toBe(true);
          expect(res.privateKey.key_ops).toEqual(['sign']);
          expect(res.privateKey.kty).toEqual('RSA');
          expect(res.privateKey.n).toBeDefined();
          
          expect(res.privateKey.d).toBeDefined();
          expect(res.privateKey.dp).toBeDefined();
          expect(res.privateKey.dq).toBeDefined();
          expect(res.privateKey.p).toBeDefined();
          expect(res.privateKey.q).toBeDefined();
          expect(res.privateKey.qi).toBeDefined();
        });
      });
    });
  });

  describe('HSA algos', () => {
    ['HS256', 'HS384', 'HS512'].map(algo => {
      env.supports({ [algo]: ['generateKey'] })
      .it(`should return a ${algo} key`, () => {
        return jwt.generateKey({
          alg: algo
        })
        .then(res => {
          expect(res.sharedKey).toBeDefined();
          expect(res.sharedKey.alg).toEqual(algo);
          expect(res.sharedKey.ext).toBe(true);
          expect(res.sharedKey.k).toBeDefined();
          expect(res.sharedKey.key_ops).toEqual(['sign', 'verify']);
          expect(res.sharedKey.kty).toEqual('oct');
        });
      });
    });
  });
  
  describe('Elliptic curve algos', () => {
    ['ES256', 'ES384', 'ES512'].map(algo => {
      env.supports({ [algo]: ['generateKey'] })
      .it(`should return a ${algo} key`, () => {
        return jwt.generateKey({
          alg: algo
        })
        .then(res => {
          expect(res.publicKey).toBeDefined();
          expect(res.publicKey.crv).toEqual('P-256');
          expect(res.publicKey.ext).toBe(true);
          expect(res.publicKey.key_ops).toEqual(['verify']);
          expect(res.publicKey.kty).toEqual('EC');
          expect(res.publicKey.x).toBeDefined();
          expect(res.publicKey.y).toBeDefined();
    
          expect(res.privateKey).toBeDefined();
          expect(res.privateKey.crv).toEqual('P-256');
          expect(res.privateKey.ext).toBe(true);
          expect(res.privateKey.key_ops).toEqual(['sign']);
          expect(res.privateKey.kty).toEqual('EC');
          expect(res.privateKey.x).toBeDefined();
          expect(res.privateKey.y).toBeDefined();
          expect(res.privateKey.d).toBeDefined();
        });
      });
    });
  });
});
