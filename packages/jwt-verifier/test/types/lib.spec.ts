import OktaJwtVerifier from '../../lib';

// All required props
const verifier = new OktaJwtVerifier({ issuer: 'https://foo' });

// With assertClaims
new OktaJwtVerifier({
  issuer: 'https://foo',
  assertClaims: { cid: '{clientId}' },
});

// @ts-expect-error Missing required props
new OktaJwtVerifier({ clientId: '1234' });

// @ts-expect-error Missing expectedAudience
verifier.verifyAccessToken('accessTokenString');
verifier.verifyAccessToken('accessTokenString', 'expectedAudience');
const verifyAccessToken = verifier.verifyAccessToken('accessTokenString', [
  'expectedAudience',
  'expectedAudience2',
]);
verifyAccessToken.then(jwt => {
  jwt.claims;
  jwt.header;
  jwt.header.alg;
  jwt.toString();
});

// @ts-expect-error Missing expectedNonce
verifier.verifyIdToken('idTokenString', 'expectedClientId');
// @ts-expect-error Invalid type for expectedClientId
verifier.verifyIdToken('idTokenString', ['expectedClientId'], 'expectedNonce');
const verifyIdToken = verifier.verifyIdToken(
  'idTokenString',
  'expectedClientId',
  'expectedNonce'
);
verifyIdToken.then(jwt => {
  jwt.claims;
  jwt.header;
  jwt.header.alg;
  jwt.toString();
});

