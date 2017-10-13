const tokens = require('../tokens');
const env = require('../env');
const jwt = env.jwt;
const util = require('../util');

describe('jwt.generateKey', () => {
  it('should throw an error if an algorithm is unsupported', () => {
    util.expectPromiseError(jwt.generateKey({ alg: 'nonexistant' }),
      `jwt in ${env.name} cannot generate nonexistant keys`);
  });

  env.supports({ RS256: ['generateKey'] })
  .it('should return a RS256 key', () => {
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

  env.supports({ RS384: ['generateKey'] })
  .it('should return a RS384 key', () => {
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

  env.supports({ RS512: ['generateKey'] })
  .it('should return a RS512 key', () => {
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

  env.supports({ HS256: ['generateKey'] })
  .it('should return a HS256 key', () => {
    return jwt.generateKey({
      alg: 'HS256'
    })
    .then(res => {
      expect(res.sharedKey).toBeDefined();
      expect(res.sharedKey.alg).toEqual('HS256');
      expect(res.sharedKey.ext).toBe(true);
      expect(res.sharedKey.k).toBeDefined();
      expect(res.sharedKey.key_ops).toEqual(['sign', 'verify']); // WebCrypto in node returns ['verify']
      expect(res.sharedKey.kty).toEqual('oct');
    });
  });

  env.supports({ HS384: ['generateKey'] })
  .it('should return a HS384 key', () => {
    return jwt.generateKey({
      alg: 'HS384'
    })
    .then(res => {
      expect(res.sharedKey).toBeDefined();
      expect(res.sharedKey.alg).toEqual('HS384');
      expect(res.sharedKey.ext).toBe(true);
      expect(res.sharedKey.k).toBeDefined();
      expect(res.sharedKey.key_ops).toEqual(['sign', 'verify']); // WebCrypto in node returns ['verify']
      expect(res.sharedKey.kty).toEqual('oct');
    });
  });

  env.supports({ HS512: ['generateKey'] })
  .it('should return a HS512 key', () => {
    return jwt.generateKey({
      alg: 'HS512'
    })
    .then(res => {
      expect(res.sharedKey).toBeDefined();
      expect(res.sharedKey.alg).toEqual('HS512');
      expect(res.sharedKey.ext).toBe(true);
      expect(res.sharedKey.k).toBeDefined();
      expect(res.sharedKey.key_ops).toEqual(['sign', 'verify']); // WebCrypto in node returns ['verify']
      expect(res.sharedKey.kty).toEqual('oct');
    });
  });

  env.supports({ ES256: ['generateKey'] })
  .it('should return a ES256 key', () => {
    return jwt.generateKey({
      alg: 'ES256'
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

  env.supports({ ES384: ['generateKey'] })
  .it('should return a ES384 key', () => {
    return jwt.generateKey({
      alg: 'ES384'
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

  env.supports({ ES512: ['generateKey'] })
  .it('should return a ES512 key', () => {
    return jwt.generateKey({
      alg: 'ES512'
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
