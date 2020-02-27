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
import { withAuth } from '@okta/okta-react';

export default withAuth(class Protected extends Component {
  constructor(props) {
    super(props);
    this.state = { userinfo: null };
    this.logout = this.logout.bind(this);
  }

  async componentDidMount() {
    const claims = await this.props.auth.getUser();
    const userinfo = JSON.stringify(claims, null, 4);
    this.setState({ userinfo });
  }

  async logout() {
    this.props.auth.logout('/');
  }

  render() {
    return (
      <div>
        <div> Protected! </div>
        {this.state.userinfo && <pre id="userinfo-container"> {this.state.userinfo} </pre>}
        <button id="logout-button" onClick={this.logout}>Logout</button>
      </div>
    );
  }
});
