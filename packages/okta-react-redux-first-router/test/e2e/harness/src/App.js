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

import React, { Component } from 'react';
import { Security, Auth } from '@okta/okta-react/redux-first-router';
import Router from './Router';

if (!Auth) {
  throw new Error('Auth should be defined');
}

class App extends Component {
  render() {
     /* global process */
    const { ISSUER, CLIENT_ID } = process.env;
    const { pkce, redirectUri } = this.props;
    return (
      <React.StrictMode>
        <Security issuer={ISSUER}
                    clientId={CLIENT_ID}
                    disableHttpsCheck={true}
                    redirectUri={redirectUri}
                    pkce={pkce}>
            <Router />
          </Security>
      </React.StrictMode>
    );
  }
}

export default App;
