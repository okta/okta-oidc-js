/*
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
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import Auth from './Auth';

export default withRouter(class Security extends Component {
  constructor(props) {
    super(props);
    this.auth = props.auth || new Auth(props);
  }

  getChildContext() {
    return {
      auth: this.auth
    };
  }

  static childContextTypes = {
    auth: PropTypes.object.isRequired
  }

  render() {
    return (
      <div>
        {this.props.children}
      </div> 
    );
  }
});
