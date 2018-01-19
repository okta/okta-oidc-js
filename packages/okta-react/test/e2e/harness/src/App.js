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
    return (
      <Router>
        <Security issuer={process.env.REACT_APP_ISSUER}
                  client_id={process.env.REACT_APP_CLIENT_ID}
                  redirect_uri={window.location.origin + '/implicit/callback'}
                  onAuthRequired={({history}) => history.push('/login')} >
          <Route path='/' component={Home}/>
          <Route path='/login' component={CustomLogin}/>
          <Route path='/sessionToken-login' component={SessionTokenLogin}/>
          <SecureRoute path='/protected' component={Protected}/>
          <Route path='/implicit/callback' component={ImplicitCallback} />
        </Security>
      </Router>
    );
  }
}

export default App;
