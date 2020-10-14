import {
  buildConfigObject
} from '@okta/configuration-validation';

import { OktaAuthOptions } from '@okta/okta-auth-js';

describe('Compatibility', () => {

  it('can accept and rerturn an OktaAuthOptions object', () => {
    const config: OktaAuthOptions = {
      tokenManager: {
        autoRenew: false
      },
      cookies: {
        secure: false
      }
    }
    const newConfig: OktaAuthOptions = buildConfigObject(config);
    expect(config).toEqual(newConfig);

  })



});
