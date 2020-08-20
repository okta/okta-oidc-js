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
import { useHistory, Route } from 'react-router-dom';

const RequireAuth = ({ render, routeProps }) => { 
  const { authService, authState } = useOktaAuth();
  const history = useHistory();

  useEffect(() => {
    // Start login if and only if app has decided it is not logged inn
    if(!authState.isAuthenticated && !authState.isPending) { 
      const fromUri = history.createHref(history.location);
      authService.login(fromUri);
    }  
  }, [authState, authService, history]);

  if (!authState.isAuthenticated) {
    return null;
  }

  return (
    <React.Fragment>
      { render(routeProps) }
    </React.Fragment>
  );
};

const SecureRoute = ( {component, render, children, ...props} ) => { 
  // react-router Route uses exactly one of: render, component, children
  // We wrap whichever they use to require authentication and use the render method on Route

  let authRender = render;

  if( component || !render ) { // React-router has component take precedence over render
    const PassedComponent = component || function() { return <React.Fragment>{children}</React.Fragment>; };
    // eslint-disable-next-line react/display-name
    authRender = wrappedProps => <PassedComponent { ...wrappedProps} />;
  }

  return (
    <Route
      { ...props }
      render={ routeProps => <RequireAuth render={authRender} routeProps={routeProps}/> }
    />
  );
};

export default SecureRoute;
