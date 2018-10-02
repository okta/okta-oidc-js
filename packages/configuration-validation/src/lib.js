/*!
 * Copyright (c) 2018-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

class ConfigurationValidationError extends Error {}

const configUtil = module.exports;

const findDomainURL = 'https://bit.ly/finding-okta-domain';
const findAppCredentialsURL = 'https://bit.ly/finding-okta-app-credentials';

const copyCredentialsMessage = 'You can copy it from the Okta Developer Console ' +
  'in the details for the Application you created. ' +
  `Follow these instructions to find it: ${findAppCredentialsURL}`;

configUtil.assertIssuer = (issuer, testing = {}) => {
  const copyMessage = 'You can copy your domain from the Okta Developer ' +
    'Console. Follow these instructions to find it: ' + findDomainURL;

  if (testing.disableHttpsCheck) {
    const httpsWarning = 'Warning: HTTPS check is disabled. ' +
      'This allows for insecure configurations and is NOT recommended for production use.';
    /* eslint-disable-next-line no-console */
    console.warn(httpsWarning);
  }

  if (!issuer) {
    throw new ConfigurationValidationError('Your Okta URL is missing. ' + copyMessage);
  } else if (!testing.disableHttpsCheck && !issuer.match(/^https:\/\//g)) {
    throw new ConfigurationValidationError(
      'Your Okta URL must start with https. ' +
      `Current value: ${issuer}. ${copyMessage}`
    );
  } else if (issuer.match(/{yourOktaDomain}/g)) {
    throw new ConfigurationValidationError('Replace {yourOktaDomain} with your Okta domain. ' + copyMessage);
  } else if (issuer.match(/-admin.(okta|oktapreview|okta-emea).com/g)) {
    throw new ConfigurationValidationError(
      'Your Okta domain should not contain -admin. ' +
      `Current value: ${issuer}. ${copyMessage}`
    );
  } else if (issuer.match(/(.com.com)|(:\/\/.*){2,}/g)) {
    throw new ConfigurationValidationError(
      'It looks like there\'s a typo in your Okta domain. ' +
      `Current value: ${issuer}. ${copyMessage}`
    );
  }
};

configUtil.assertClientId = (clientId) => {
  if (!clientId) {
    throw new ConfigurationValidationError('Your client ID is missing. ' + copyCredentialsMessage);
  } else if (clientId.match(/{clientId}/g)) {
    throw new ConfigurationValidationError('Replace {clientId} with the client ID of your Application. ' + copyCredentialsMessage);
  }
};

configUtil.assertClientSecret = (clientSecret) => {
  if (!clientSecret) {
    throw new ConfigurationValidationError('Your client secret is missing. ' + copyCredentialsMessage);
  } else if (clientSecret.match(/{clientSecret}/g)) {
    throw new ConfigurationValidationError('Replace {clientSecret} with the client secret of your Application. ' + copyCredentialsMessage);
  }
};

configUtil.assertRedirectUri = (redirectUri) => {
  if (!redirectUri) {
    throw new ConfigurationValidationError('Your redirect URI is missing.');
  } else if (redirectUri.match(/{redirectUri}/g)) {
    throw new ConfigurationValidationError('Replace {redirectUri} with the redirect URI of your Application.');
  }
};
