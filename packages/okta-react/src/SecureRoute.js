/*
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
import { Route } from 'react-router';
import withAuth from './withAuth';


class RenderWrapper extends Component {
  checkAuthentication() {
    if (this.props.authenticated === false) {
      this.props.login();
    }
  }

  /* eslint-disable-next-line react/no-deprecated */
  componentWillMount() {
    this.checkAuthentication();
  }

  componentDidUpdate() {
    this.checkAuthentication();
  }

  render() {
    if (!this.props.authenticated) {
      return null;
    }

    const C = this.props.component;
    return this.props.render ? this.props.render(this.props.renderProps) : <C {...this.props.renderProps} />;
  }
}

class SecureRoute extends Component {
  constructor(props) {
    super(props);

    this.state = {
      authenticated: null
    };

    this.checkAuthentication = this.checkAuthentication.bind(this);
    this.createRenderWrapper = this.createRenderWrapper.bind(this);

    this.checkAuthentication();
  }

  async checkAuthentication() {
    const authenticated = await this.props.auth.isAuthenticated();
    if (authenticated !== this.state.authenticated) {
      this.setState({ authenticated });
    }
  }

  componentDidUpdate() {
    this.checkAuthentication();
  }

  createRenderWrapper(renderProps) {
    return (
      <RenderWrapper
        authenticated={this.state.authenticated}
        login={this.props.auth.login}
        component={this.props.component}
        render={this.props.render}
        renderProps={renderProps}
      />
    );
  }

  render() {
    return (
      <Route
        path={this.props.path}
        exact={this.props.exact}
        strict={this.props.strict}
        sensitive={this.props.sensitive}
        render={this.createRenderWrapper}
      />
    );
  }
}

export default withAuth(SecureRoute);
