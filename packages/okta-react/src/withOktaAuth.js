/*
 * Copyright (c) 2020-Present, Okta, Inc. and/or its affiliates. All rights reserved.
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

const withOktaAuth = (ComponentToWrap) => { 
  const WrappedComponent = (props) => { 
    const oktaAuthProps = useOktaAuth();
    return <ComponentToWrap {...oktaAuthProps } {...props} />;
  };
  WrappedComponent.displayName = 'withOktaAuth_' + (ComponentToWrap.displayName || ComponentToWrap.name);
  return WrappedComponent;
};

export default withOktaAuth;
