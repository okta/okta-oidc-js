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
import { Redirect } from 'react-router';
import withAuth from './withAuth';

export default withAuth(class ImplicitCallback extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authenticated: null,
      error: null
    };
  }

  componentDidMount() {
    this.props.auth.handleAuthentication()
    .then(() => {
      const location = this.props.auth.getFromUri();
      this.setState({ authenticated: true, location });
    })
    .catch(err => this.setState({ authenticated: false, error: err.toString() }));
  }

  render() {
    const { error, authenticated, location } = this.state;
    if (error) {
      return <p>{error}</p>;
    }

    if (authenticated && location) {
      return <Redirect to={location}/>;
    }

    return null;
  }
});
