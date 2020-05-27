/*
 * Copyright (c) 2019, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

#import "ReactNativeOktaSdkBridge-Bridging-Header.h"

@interface RCT_EXTERN_MODULE(OktaSdkBridge, RCTEventEmitter)

RCT_EXTERN_METHOD(
  createConfig:
  (NSString *)clientId 
  redirectUrl:(NSString *)redirectUrl 
  endSessionRedirectUri:(NSString *)endSessionRedirectUri 
  discoveryUri:(NSString *)discoveryUri 
  scopes:(NSString *)scopes 
  userAgentTemplate:(NSString *)userAgentTemplate 
  promiseResolver:(RCTPromiseResolveBlock *)promiseResolver 
  promiseRejecter:(RCTPromiseRejectBlock *)promiseRejecter
)

RCT_EXTERN_METHOD(signIn)

RCT_EXTERN_METHOD(
  authenticate:
  (NSString *)sessionToken
  promiseResolver:(RCTPromiseResolveBlock *)promiseResolver
  promiseRejecter:(RCTPromiseRejectBlock *)promiseRejecter
)

RCT_EXTERN_METHOD(signOut)

RCT_EXTERN_METHOD(getAccessToken:(RCTPromiseResolveBlock *)promiseResolver promiseRejecter:(RCTPromiseRejectBlock *)promiseRejecter)

RCT_EXTERN_METHOD(getIdToken:(RCTPromiseResolveBlock *)promiseResolver promiseRejecter:(RCTPromiseRejectBlock *)promiseRejecter)

RCT_EXTERN_METHOD(getUser:(RCTPromiseResolveBlock *)promiseResolver promiseRejecter:(RCTPromiseRejectBlock *)promiseRejecter)

RCT_EXTERN_METHOD(isAuthenticated:(RCTPromiseResolveBlock *)promiseResolver promiseRejecter:(RCTPromiseRejectBlock *)promiseRejecter)

RCT_EXTERN_METHOD(revokeAccessToken:(RCTPromiseResolveBlock *)promiseResolver promiseRejecter:(RCTPromiseRejectBlock *)promiseRejecter)

RCT_EXTERN_METHOD(revokeIdToken:(RCTPromiseResolveBlock *)promiseResolver promiseRejecter:(RCTPromiseRejectBlock *)promiseRejecter)

RCT_EXTERN_METHOD(revokeRefreshToken:(RCTPromiseResolveBlock *)promiseResolver promiseRejecter:(RCTPromiseRejectBlock *)promiseRejecter)

RCT_EXTERN_METHOD(introspectAccessToken:(RCTPromiseResolveBlock *)promiseResolver promiseRejecter:(RCTPromiseRejectBlock *)promiseRejecter)

RCT_EXTERN_METHOD(introspectIdToken:(RCTPromiseResolveBlock *)promiseResolver promiseRejecter:(RCTPromiseRejectBlock *)promiseRejecter)

RCT_EXTERN_METHOD(introspectRefreshToken:(RCTPromiseResolveBlock *)promiseResolver promiseRejecter:(RCTPromiseRejectBlock *)promiseRejecter)

RCT_EXTERN_METHOD(refreshTokens:(RCTPromiseResolveBlock *)promiseResolver promiseRejecter:(RCTPromiseRejectBlock *)promiseRejecter)

RCT_EXTERN_METHOD(clearTokens:(RCTPromiseResolveBlock *)promiseResolver promiseRejecter:(RCTPromiseRejectBlock *)promiseRejecter)

@end
