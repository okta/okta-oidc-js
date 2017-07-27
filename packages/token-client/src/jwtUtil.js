import base64url from 'base64url';
import {TokenValidationError} from './errors';
import util from './util';

const jwtUtil = {};
export default jwtUtil;

jwtUtil.decode = token => {
  const jwt = token.split('.');
  return {
    header: JSON.parse(base64url.decode(jwt[0])),
    payload: JSON.parse(base64url.decode(jwt[1])),
    signature: jwt[2]
  };
};

jwtUtil.browserSupportsCrypto = () =>
  typeof crypto !== 'undefined'
  && crypto.subtle
  && typeof Uint8Array !== 'undefined';

jwtUtil.verifyTokenSignature = async (jwks_uri, token) => {
  const decodedToken = jwtUtil.decode(token);
  const keysResp = await fetch(jwks_uri);
  const keysJson = await keysResp.json();

  const key = keysJson.keys.find(key => key.kid === decodedToken.header.kid);
  if (!key) {
    throw new TokenValidationError(`The key id of ${decodedToken.header.kid} could not be found`);
  }

  // We currently only validate RS256 signatures in browsers that support crypto
  if (!jwtUtil.browserSupportsCrypto() || decodedToken.header.alg !== 'RS256') {
    return true;
  }

  const format = 'jwk';
  const algo = {
    name: 'RSASSA-PKCS1-v1_5',
    hash: { name: 'SHA-256' }
  };
  const extractable = true;
  const usages = ['verify'];

  // https://connect.microsoft.com/IE/feedback/details/2242108/webcryptoapi-importing-jwk-with-use-field-fails
  // This is a metadata tag that specifies the intent of how the key should be used.
  // It's not necessary to properly verify the jwt's signature.
  delete key.use;

  const cryptoKey = await crypto.subtle.importKey(
    format,
    key,
    algo,
    extractable,
    usages
  );

  const jwt = token.split('.');
  const payload = util.stringToBuffer(jwt[0] + '.' + jwt[1]);
  const signature = base64url.toBuffer(jwt[2]);

  let verified;
  try {
    verified = await crypto.subtle.verify(
      algo,
      cryptoKey,
      signature,
      payload
    );
  } catch(e) {
    throw new TokenValidationError(`Trouble verifying token: ${e.message}`);
  }

  if (!verified) {
    throw new TokenValidationError(`The signature is invalid for ${token}`);
  }

  return true;
};
