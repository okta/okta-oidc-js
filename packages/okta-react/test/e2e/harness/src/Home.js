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
import { Link } from 'react-router-dom';
import { withOktaAuth } from '@okta/okta-react';

export default withOktaAuth(class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      renewMessage: '',
    };

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.renewIdToken = this.renewToken.bind(this, 'idToken');
    this.renewAccessToken = this.renewToken.bind(this, 'accessToken');
  }

  async login() {
    this.props.authService.login('/protected');
  }

  async logout() {
    this.props.authService.logout('/');
  }

  renewToken(tokenName) {
    const tokenManager = this.props.authService.getTokenManager();
    tokenManager.renew(tokenName)
      .then(() => {
        this.setState({
          renewMessage: `Token ${tokenName} was renewed`,
        });
      })
      .catch(e => {
        this.setState({
          renewMessage: `Error renewing ${tokenName}: ${e}`,
        });
      });
  }

  render() {
    if (this.props.authState.isPending) {
      return null;
    }

    const button = this.props.authState.isAuthenticated ?
      <button id="logout-button" onClick={this.logout}>Logout</button> :
      <button id="login-button" onClick={this.login}>Login</button>;

    const pkce = this.props.authService._oktaAuth.options.pkce;

    return (
      <div>
        <div id="login-flow">{ pkce ? 'PKCE' : 'implicit'}</div>
        <hr/>
        <Link to='/'>Home</Link><br/>
        <Link to='/protected'>Protected</Link><br/>
        <Link to='/sessionToken-login'>Session Token Login</Link><br/>
        {button}
        { this.props.authState.isAuthenticated ? <button id="renew-id-token-button" onClick={this.renewIdToken}>Renew ID Token</button> : null }
        { this.props.authState.isAuthenticated ? <button id="renew-access-token-button" onClick={this.renewAccessToken}>Renew Access Token</button> : null }
        <div id="renew-message">
          { this.state.renewMessage }
        </div>
      </div>
    );
  }
});
