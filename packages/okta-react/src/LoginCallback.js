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

import { useEffect } from 'react';
import { useAuth, useAuthState } from './OktaContext';

const ImplicitCallback = () => { 
  const auth = useAuth();
  const authState = useAuthState();

  useEffect( () => {
    if(authState.isPending) { 
      auth.handleAuthentication()
        .catch( err => {
          // FIXME error
          console.log('implicit callback unhappiness', err) 
        });
    }
  });

  if( authState.isAuthenticated ) { 
    const location = auth.getFromUri();
    if( location ) { 
      window.location.assign(location);
    }
  }
  return null;
};

export default ImplicitCallback;
