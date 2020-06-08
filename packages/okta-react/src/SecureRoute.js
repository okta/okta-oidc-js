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

import React from 'react';
import { useOktaAuth } from './OktaContext';
import { useHistory, Route } from 'react-router-dom';

const RequireAuth = ({ children }) => { 
  const { authService, authState } = useOktaAuth();
  const history = useHistory();

  if(!authState.isAuthenticated) { 
    if(!authState.isPending) { 
      const fromUri = history.createHref(history.location);
      authService.login(fromUri);
    }
    return null;
  }

  return (
    <React.Fragment>
      {children}
    </React.Fragment>
  );

};

const SecureRoute = ( {component, ...props} ) => { 

  const PassedComponent = component || function() { return null; };
  const WrappedComponent = (wrappedProps) => (<RequireAuth><PassedComponent {...wrappedProps}/></RequireAuth>);
  return (
    <Route
      { ...props }
      render={ (routeProps) => props.render ? props.render({...routeProps, component: WrappedComponent}) : <WrappedComponent {...routeProps}/> } 
    />
  );
};

export default SecureRoute;
