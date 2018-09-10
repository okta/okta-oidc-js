/*!
 * Copyright (c) 2017-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

class OIDCMiddlewareError extends Error {}

const configUtil = module.exports;

const findDomainURL = 'https://bit.ly/finding-okta-domain';
const findAppCredentialsURL = 'https://bit.ly/finding-okta-app-credentials';

configUtil.assertIssuer = (issuer, skip = {}) => {
  const copyMessage = 'You can copy your domain from the Okta Developer ' +
    'Console. Follow these instructions to find it: ' + findDomainURL;

  if (!issuer) {
    throw new OIDCMiddlewareError('Your Okta URL is missing. ' + copyMessage);
  } else if (!skip.https && !issuer.match(/^https:\/\//g)) {
    throw new OIDCMiddlewareError(
      'Your Okta URL must start with https. ' +
      `Current value: ${issuer}. ${copyMessage}`
    );
  } else if (issuer.match(/{yourOktaDomain}/g)) {
    throw new OIDCMiddlewareError('Replace {yourOktaDomain} with your Okta domain. ' + copyMessage);
  } else if (issuer.match(/-admin.(okta|oktapreview|okta-emea).com/g)) {
    throw new OIDCMiddlewareError(
      'Your Okta domain should not contain -admin. ' +
      `Current value: ${issuer}. ${copyMessage}`
    );
  } else if (issuer.match(/(.com.com)|(:\/\/.*){2,}/g)) {
    throw new OIDCMiddlewareError(
      'It looks like there\'s a typo in your Okta domain. ' +
      `Current value: ${issuer}. ${copyMessage}`
    );
  }
};

configUtil.assertClientCredentials = (clientIdOrSecret) => {
  const copyMessage = 'You can copy it from the Okta Developer Console ' +
    'in the details for the Application you created. ' +
    `Follow these instructions to find it: ${findAppCredentialsURL}`;

  if (!clientIdOrSecret) {
    throw new OIDCMiddlewareError('Your client credentials are missing. ' + copyMessage);
  } else if (clientIdOrSecret.match(/{clientId}/g)) {
    throw new OIDCMiddlewareError('Replace {clientId} with the client ID of your Application. ' + copyMessage);
  } else if (clientIdOrSecret.match(/{clientSecret}/g)) {
    throw new OIDCMiddlewareError('Replace {clientSecret} with the client secret of your Application. ' + copyMessage);
  }
};

configUtil.assertRedirectUri = (redirectUri) => {
  if (!redirectUri) {
    throw new OIDCMiddlewareError('Your redirect URI is missing.');
  } else if (redirectUri.match(/{redirectUri}/g)) {
    throw new OIDCMiddlewareError('Replace {redirectUri} with the redirect URI of your Application.');
  }
};
