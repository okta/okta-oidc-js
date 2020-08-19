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

import React, { useState, useEffect, useMemo } from 'react';
import {
  buildConfigObject
} from '@okta/configuration-validation';
import { OktaAuth, DEFAULT_AUTH_STATE, EVENT_AUTH_STATE_CHANGE } from '@okta/okta-auth-js';
import OktaContext from './OktaContext';

const Security = (props) => { 

  const initialAuthService = useMemo( () => { 
    // don't keep spawning new service instances if this component rerenders
    // normalize authJS config. In this SDK, we allow underscore on certain properties, but AuthJS consistently uses camel case.
    const authConfig = buildConfigObject(props);
    return props.authService || new OktaAuth(authConfig);
  }, [ props ]);

  const [authService] = useState( initialAuthService );
  const [authState, setAuthState] = useState({ ...DEFAULT_AUTH_STATE });
  
  useEffect(() => {
    authService.emitter.on(EVENT_AUTH_STATE_CHANGE, (authState) => {
      setAuthState(authState);
    });

    if (!authService.token.isLoginRedirect()) {
      // Trigger an initial change event to make sure authState is latest when not in loginRedirect state
      authService.initialAuthState();
    }

    return () => authService.emitter.off(EVENT_AUTH_STATE_CHANGE);
  }, [authService]);

  return (
    <OktaContext.Provider value={{ authService, authState }}>
      {props.children}
    </OktaContext.Provider>
  );
};

export default Security;
