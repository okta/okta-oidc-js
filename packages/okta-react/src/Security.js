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
import AuthService from './AuthService';
import OktaContext from './OktaContext';

const Security = (props) => { 

  const initialAuthService = useMemo( () => { 
    // don't keep spawning new service instances if this component rerenders
    return props.authService || new AuthService(props);
  }, [ props ]);

  const [authService] = useState( initialAuthService );
  const [authState, setAuthState] = useState(authService.getAuthState());
  
  useEffect( () => { 
    const unsub = authService.on('authStateChange', () => {
      setAuthState(authService.getAuthState());
    });

    authService.updateAuthState(); // Trigger an initial change event to make sure authState is latest
    return unsub;
  }, [authService]);

  return (
    <OktaContext.Provider value={ { authService, authState } }>
      {props.children}
    </OktaContext.Provider>
  );
};

export default Security;
