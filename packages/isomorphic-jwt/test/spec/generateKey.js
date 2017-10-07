const tokens = require('../tokens');
const env = require('../env');
const jwt = env.jwt;
const util = require('../util');

describe('jwt.generateKey', () => {
  it('should throw an error if an algorithm is unsupported', () => {
    util.expectPromiseError(jwt.generateKey({ alg: 'nonexistant' }),
      `jwt in ${env.name} cannot generate nonexistant keys`);
  });

  env.supports('RS256').it('should return a RS256 key', () => {
    return jwt.generateKey({
      alg: 'RS256'
    })
    .then(res => {
      expect(res.publicKey).toBeDefined();
      expect(res.publicKey.alg).toEqual('RS256');
      expect(res.publicKey.e).toEqual('AQAB');
      expect(res.publicKey.ext).toBe(true);
      expect(res.publicKey.key_ops).toEqual(['verify']); // WebCrypto in node returns ['verify']
      expect(res.publicKey.kty).toEqual('RSA');
      expect(res.publicKey.n).toBeDefined();

      expect(res.privateKey).toBeDefined();
      expect(res.privateKey.alg).toEqual('RS256');
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

  env.supports('RS384').it('should return a RS384 key', () => {
    return jwt.generateKey({
      alg: 'RS384'
    })
    .then(res => {
      expect(res.publicKey).toBeDefined();
      expect(res.publicKey.alg).toEqual('RS384');
      expect(res.publicKey.e).toEqual('AQAB');
      expect(res.publicKey.ext).toBe(true);
      expect(res.publicKey.key_ops).toEqual(['verify']); // WebCrypto in node returns ['verify']
      expect(res.publicKey.kty).toEqual('RSA');
      expect(res.publicKey.n).toBeDefined();

      expect(res.privateKey).toBeDefined();
      expect(res.privateKey.alg).toEqual('RS384');
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

  env.supports('RS512').it('should return a RS512 key', () => {
    return jwt.generateKey({
      alg: 'RS512'
    })
    .then(res => {
      expect(res.publicKey).toBeDefined();
      expect(res.publicKey.alg).toEqual('RS512');
      expect(res.publicKey.e).toEqual('AQAB');
      expect(res.publicKey.ext).toBe(true);
      expect(res.publicKey.key_ops).toEqual(['verify']); // WebCrypto in node returns ['verify']
      expect(res.publicKey.kty).toEqual('RSA');
      expect(res.publicKey.n).toBeDefined();

      expect(res.privateKey).toBeDefined();
      expect(res.privateKey.alg).toEqual('RS512');
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
