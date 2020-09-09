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

import React, { useEffect } from 'react';
import { useOktaAuth } from './OktaContext';
import { Route, useRouteMatch } from 'react-router-dom';

const SecureRoute = ( props ) => { 
  const { authService, authState } = useOktaAuth();
  const match = useRouteMatch(props);

  useEffect(() => {
    // Only process logic if the route matches
    if (!match) {
      return;
    }
    // Start login if and only if app has decided it is not logged inn
    if(!authState.isAuthenticated && !authState.isPending) { 
      authService.login();
    }  
  }, [authState.isPending, authState.isAuthenticated, authService, match]);

  if (!authState.isAuthenticated) {
    return null;
  }

  return (
    <Route
      { ...props }
    />
  );
};

export default SecureRoute;
