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

import React, { useRef, useEffect } from 'react';
import { withRouter } from 'react-router';
import Auth from './Auth';
import OktaContext from './OktaContext';

const Security = (props) => {
  const auth = useRef(null);

  useEffect(() => {
    auth.current = props.auth || new Auth(props);
  }, [props]);

  return (
    <OktaContext.Provider auth={auth.current}>
      <div className={props.className}>
        {props.children}
      </div>
    </OktaContext.Provider>
  );
};

export default withRouter(Security);
