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

const isHttps = new RegExp('^https://');
const hasProtocol = new RegExp('://');
const hasDomainAdmin = /-admin.(okta|oktapreview|okta-emea).com/;
const hasDomainTypo = new RegExp('(.com.com)|(://.*){2,}');
const endsInPath = new RegExp('/$');

configUtil.buildConfigObject = (config) => {
  return {
    clientId: config.clientId || config.client_id,
    issuer: config.issuer,
    redirectUri: config.redirectUri || config.redirect_uri,
    tokenManager: {
      storage: config.storage,
      autoRenew: config.autoRenew || config.auto_renew
    }
  }
}

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
  } else if (!testing.disableHttpsCheck && !issuer.match(isHttps)) {
    throw new ConfigurationValidationError(
      'Your Okta URL must start with https. ' +
      `Current value: ${issuer}. ${copyMessage}`
    );
  } else if (issuer.match(/{yourOktaDomain}/)) {
    throw new ConfigurationValidationError('Replace {yourOktaDomain} with your Okta domain. ' + copyMessage);
  } else if (issuer.match(hasDomainAdmin)) {
    throw new ConfigurationValidationError(
      'Your Okta domain should not contain -admin. ' +
      `Current value: ${issuer}. ${copyMessage}`
    );
  } else if (issuer.match(hasDomainTypo)) {
    throw new ConfigurationValidationError(
      'It looks like there\'s a typo in your Okta domain. ' +
      `Current value: ${issuer}. ${copyMessage}`
    );
  }
};

configUtil.assertClientId = (clientId) => {
  if (!clientId) {
    throw new ConfigurationValidationError('Your client ID is missing. ' + copyCredentialsMessage);
  } else if (clientId.match(/{clientId}/)) {
    throw new ConfigurationValidationError('Replace {clientId} with the client ID of your Application. ' + copyCredentialsMessage);
  }
};

configUtil.assertClientSecret = (clientSecret) => {
  if (!clientSecret) {
    throw new ConfigurationValidationError('Your client secret is missing. ' + copyCredentialsMessage);
  } else if (clientSecret.match(/{clientSecret}/)) {
    throw new ConfigurationValidationError('Replace {clientSecret} with the client secret of your Application. ' + copyCredentialsMessage);
  }
};

configUtil.assertRedirectUri = (redirectUri) => {
  if (!redirectUri) {
    throw new ConfigurationValidationError('Your redirect URI is missing.');
  } else if (redirectUri.match(/{redirectUri}/)) {
    throw new ConfigurationValidationError('Replace {redirectUri} with the redirect URI of your Application.');
  }
};

configUtil.assertAppBaseUrl = (appBaseUrl) => { 
  if (!appBaseUrl) { 
    throw new ConfigurationValidationError('Your appBaseUrl is missing.');
  } else if (appBaseUrl.match(/{appBaseUrl}/)) {
    throw new ConfigurationValidationError('Replace {appBaseUrl} with the base URL of your Application.');
  } else if (!appBaseUrl.match(hasProtocol)) {
    throw new ConfigurationValidationError(`Your appBaseUrl must contain a protocol (e.g. https://). Current value: ${appBaseUrl}.`);
  } else if (appBaseUrl.match(endsInPath)) {
    throw new ConfigurationValidationError(`Your appBaseUrl must not end in a '/'. Current value: ${appBaseUrl}.`);
  } 
};
