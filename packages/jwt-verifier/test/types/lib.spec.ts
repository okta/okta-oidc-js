import OktaJwtVerifier from '../../lib';
import {expectType, expectError, expectAssignable, expectNotAssignable} from 'tsd';

const main = async () => {
  // OktaJwtVerifier constructor
  // issuer is required
  const verifier = new OktaJwtVerifier({ issuer: 'https://foo' });
  expectType<OktaJwtVerifier>(verifier);
  // Expected error: Missing issuer
  expectError(new OktaJwtVerifier({ clientId: '1234' }));
  // With all options
  expectType<OktaJwtVerifier>(new OktaJwtVerifier({
    issuer: 'https://foo',
    clientId: '1234',
    assertClaims: { cid: '{clientId}' },
    cacheMaxAge: 1000*60*60*2,
    jwksRequestsPerMinute: 100
  }));

  // verifyAccessToken
  // Expected error: Missing expectedAudience
  expectError(verifier.verifyAccessToken('accessTokenString'));
  expectType<OktaJwtVerifier.Jwt>(await verifier.verifyAccessToken('accessTokenString', 'expectedAudience'));
  const jwt = await verifier.verifyAccessToken('accessTokenString', [
    'expectedAudience',
    'expectedAudience2',
  ]);

  // JWT
  expectType<OktaJwtVerifier.JwtClaims>(jwt.claims);
  expectType<OktaJwtVerifier.JwtHeader>(jwt.header);
  expectType<string>(jwt.toString());

  // JWT Claims
  expectAssignable<OktaJwtVerifier.JwtClaims>({    
    jti: "AT.0mP4JKAZX1iACIT4vbEDF7LpvDVjxypPMf0D7uX39RE",
    iss: "https://${yourOktaDomain}/oauth2/0oacqf8qaJw56czJi0g4",
    aud: "https://api.example.com",
    sub: "00ujmkLgagxeRrAg20g3",
    iat: 1467145094,
    exp: 1467148694,
    cid: "nmdP1fcyvdVO11AL7ECm",
    uid: "00ujmkLgagxeRrAg20g3",
    scp: [
      "openid",
      "email",
      "flights",
      "custom"
    ],
    custom_claim: "CustomValue"
  });
  expectNotAssignable<OktaJwtVerifier.JwtClaims>({
    exp: 'not-a-number'
  });

  // JWT Header
  expectAssignable<OktaJwtVerifier.JwtHeader>({
    alg: 'RS256',
    kid: "45js03w0djwedsw",
    typ: 'JWT'
  });
  expectNotAssignable<OktaJwtVerifier.JwtHeader>({
    alg: 'unsupported-alg',
  });

  // verifyIdToken
  // Expected error: Missing expectedClientId
  expectError(verifier.verifyIdToken('idTokenString'));
  // Expected error: Missing expectedNonce
  expectError(verifier.verifyIdToken('idTokenString', 'expectedClientId'));
  // Expected error: Invalid type for expectedClientId
  expectError(verifier.verifyIdToken('idTokenString', ['expectedClientId'], 'expectedNonce'));
  expectType<OktaJwtVerifier.Jwt>(await verifier.verifyIdToken('idTokenString', 'expectedClientId', 'expectedNonce'));
};

main();
