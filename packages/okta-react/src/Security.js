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

import React, { useState, useEffect } from 'react';
import Auth from './Auth';
import OktaContext from './OktaContext';

const Security = (props) => { 

  const [auth] = useState( props.auth || new Auth(props) );
  const [authState, setAuthState] = useState({...Auth.DEFAULT_STATE});

  console.log('in security render');

  useEffect( () => { 
    let unsub;
    unsub = auth.on('authStateChange', (newAuthState) => { 
      setAuthState(newAuthState);
    });
    auth.updateAuthState(); // Force an authStateChange event to set the initial state
    return unsub;
  }, [auth]);

  return (
    <OktaContext.auth.Provider value={auth}>
    <OktaContext.authState.Provider value={authState}>
      <div className={props.className}>
        {props.children}
      </div>
    </OktaContext.authState.Provider>
    </OktaContext.auth.Provider>
  );
};

export default Security;
