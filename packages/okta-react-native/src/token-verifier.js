import jwt from 'jwt-lite';
import * as util from './token-client-util';

export default class TokenVerifier {
  constructor(options = {}) {
    if (!options.jwks_uri) {
      throw new Error('Must provide a jwks_uri');
    }
    this._jwks_uri = options.jwks_uri;
  }

  async verify(token) {
    const decoded = jwt.decode(token);
    if (!decoded.header || !decoded.header.kid) {
      throw new Error('No token header kid to verify signature');
    }
    
    // Get the jwks list
    const jwks = await util.request(this._jwks_uri);

    let publicKey;
    for (let key of jwks.keys) {
      if (key.kid === decoded.header.kid) {
        publicKey = key;
        break;
      }
    }
    if (!publicKey) {
      throw new Error(`No key available with an id of ${decoded.header.kid}`);
    }
    try {
      return await jwt.verify(token, publicKey);
    } catch(e) {
      throw new Error(`Unable to verify token: ${e.message}`);
    }
  }
}
