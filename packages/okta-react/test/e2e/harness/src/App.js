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
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Security, SecureRoute, ImplicitCallback, Auth } from '@okta/okta-react';
import Home from './Home';
import Protected from './Protected';
import CustomLogin from './CustomLogin';
import SessionTokenLogin from './SessionTokenLogin';

if (!Auth) {
  throw new Error('Auth should be defined');
}

class App extends Component {
  render() {
     /* global process */
    const { REACT_APP_ISSUER, REACT_APP_CLIENT_ID } = process.env;
    const { pkce, redirectUri } = this.props;
    return (
      <React.StrictMode>
        <Router>
          <Security issuer={REACT_APP_ISSUER}
                    clientId={REACT_APP_CLIENT_ID}
                    disableHttpsCheck={true}
                    redirectUri={redirectUri}
                    onAuthRequired={({history}) => history.push('/login')}
                    pkce={pkce}>
            <Route path='/' component={Home}/>
            <Route path='/login' component={CustomLogin}/>
            <Route path='/sessionToken-login' component={SessionTokenLogin}/>
            <SecureRoute exact path='/protected' component={Protected}/>
            <Route path='/implicit/callback' component={ImplicitCallback} />
            <Route path='/pkce/callback' component={ImplicitCallback} />
          </Security>
        </Router>
      </React.StrictMode>
    );
  }
}

export default App;
