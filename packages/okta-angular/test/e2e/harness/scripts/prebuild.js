/*!
 * Copyright (c) 2017, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

#!/usr/bin/env node

/** Angular CLI does not support environment variables the same
 * way Node apps do. See:
 * https://github.com/angular/angular-cli/issues/4318
 */
const fs = require('fs');
const path = require('path');

const ejs = require('ejs');

const environmentFilesDirectory = path.join(__dirname, '../src/environments');
const targetEnvironmentTemplateFileName = 'environment.ts.template';
const targetEnvironmentFileName = 'environment.ts';

const defaultEnvValues = {
  PORT: 3000,
  BASE_URI: 'http://localhost:3000',
  REDIRECT_URI: 'http://localhost:3000/implicit/callback',
  ISSUER: 'https://{yourOktaDomain}.com/oauth2/default',
  CLIENT_ID: '{clientId}',
  CLIENT_SECRET: '{clientSecret}',
  USERNAME: '{userName}',
  PASSWORD: '{password}',
};

// Load template file
const environmentTemplate = fs.readFileSync(
  path.join(environmentFilesDirectory, targetEnvironmentTemplateFileName),
  {encoding: 'utf-8'}
);

// Generate output data
const output = ejs.render(environmentTemplate, Object.assign({}, defaultEnvValues, process.env));
// Write environment file
fs.writeFileSync(path.join(environmentFilesDirectory, targetEnvironmentFileName), output);

process.exit(0);