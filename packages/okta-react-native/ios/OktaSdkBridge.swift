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

import Foundation
import OktaOidc

@objc(OktaSdkBridge)
class OktaSdkBridge: RCTEventEmitter {
    
    var oktaOidc: OktaOidc?
    var config: OktaOidcConfig?
    
    @objc
    func createConfig(_ clientId: String,
                      redirectUrl: String,
                      endSessionRedirectUri: String,
                      discoveryUri: String,
                      scopes: String,
                      promiseResolver: RCTPromiseResolveBlock,
                      promiseRejecter: RCTPromiseRejectBlock) -> Void {
        do {
            config = try OktaOidcConfig(with: [
                "issuer": discoveryUri,
                "clientId": clientId,
                "redirectUri": redirectUrl,
                "logoutRedirectUri": endSessionRedirectUri,
                "scopes": scopes
                ])
            oktaOidc = try OktaOidc(configuration: config)
            promiseResolver(true)
        } catch let error {
            promiseRejecter(OktaReactNativeError.oktaOidcError.errorCode, error.localizedDescription, error)
        }
    }
    
    @objc
    func signIn() {
        guard let currOktaOidc = oktaOidc else {
            let error = OktaReactNativeError.notConfigured
            let errorDic = [
                OktaSdkConstant.ERROR_CODE_KEY: error.errorCode,
                OktaSdkConstant.ERROR_MSG_KEY: error.errorDescription
            ]
            sendEvent(withName: OktaSdkConstant.ON_ERROR, body: errorDic)
            return
        }
        
        guard let view = RCTPresentedViewController() else {
            let error = OktaReactNativeError.noView
            let errorDic = [
                OktaSdkConstant.ERROR_CODE_KEY: error.errorCode,
                OktaSdkConstant.ERROR_MSG_KEY: error.errorDescription
            ]
            sendEvent(withName: OktaSdkConstant.ON_ERROR, body: errorDic)
            return
        }
        
        currOktaOidc.signInWithBrowser(from: view) { stateManager, error in
            if let error = error {
                let errorDic = [
                    OktaSdkConstant.ERROR_CODE_KEY: OktaReactNativeError.oktaOidcError.errorCode,
                    OktaSdkConstant.ERROR_MSG_KEY: error.localizedDescription
                ]
                self.sendEvent(withName: OktaSdkConstant.ON_ERROR, body: errorDic)
                return
            }
            
            guard let currStateManager = stateManager else {
                let error = OktaReactNativeError.noStateManager
                let errorDic = [
                    OktaSdkConstant.ERROR_CODE_KEY: error.errorCode,
                    OktaSdkConstant.ERROR_MSG_KEY: error.errorDescription
                ]
                self.sendEvent(withName: OktaSdkConstant.ON_ERROR, body: errorDic)
                return
            }
            
            currStateManager.writeToSecureStorage()
            let dic = [
                OktaSdkConstant.RESOLVE_TYPE_KEY: OktaSdkConstant.AUTHORIZED,
                OktaSdkConstant.ACCESS_TOKEN_KEY: stateManager?.accessToken
            ]
            
            self.sendEvent(withName: OktaSdkConstant.SIGN_IN_SUCCESS, body: dic)
        }
    }
    
    @objc
    func signOut() {
        guard let oidcConfig = config, let currOktaOidc = oktaOidc else {
            let error = OktaReactNativeError.notConfigured
            let errorDic = [
                OktaSdkConstant.ERROR_CODE_KEY: error.errorCode,
                OktaSdkConstant.ERROR_MSG_KEY: error.errorDescription
            ]
            sendEvent(withName: OktaSdkConstant.ON_ERROR, body: errorDic)
            return
        }
        
        guard let view = RCTPresentedViewController() else {
            let error = OktaReactNativeError.noView
            let errorDic = [
                OktaSdkConstant.ERROR_CODE_KEY: error.errorCode,
                OktaSdkConstant.ERROR_MSG_KEY: error.errorDescription
            ]
            sendEvent(withName: OktaSdkConstant.ON_ERROR, body: errorDic)
            return
        }
        
        guard let stateManager = OktaOidcStateManager.readFromSecureStorage(for: oidcConfig) else {
            let error = OktaReactNativeError.unauthenticated
            let errorDic = [
                OktaSdkConstant.ERROR_CODE_KEY: error.errorCode,
                OktaSdkConstant.ERROR_MSG_KEY: error.errorDescription
            ]
            sendEvent(withName: OktaSdkConstant.ON_ERROR, body: errorDic)
            return
        }
        
        currOktaOidc.signOutOfOkta(stateManager, from: view) { error in
            if let error = error {
                let errorDic = [
                    OktaSdkConstant.ERROR_CODE_KEY: OktaReactNativeError.oktaOidcError.errorCode,
                    OktaSdkConstant.ERROR_MSG_KEY: error.localizedDescription
                ]
                self.sendEvent(withName: OktaSdkConstant.ON_ERROR, body: errorDic)
                return
            }
            
            let dic = [
                OktaSdkConstant.RESOLVE_TYPE_KEY: OktaSdkConstant.SIGNED_OUT
            ]
            stateManager.clear()
            
            self.sendEvent(withName: OktaSdkConstant.SIGN_OUT_SUCCESS, body: dic)
        }
    }

    @objc
    func authenticate(_ sessionToken: String,
                      promiseResolver: @escaping RCTPromiseResolveBlock,
                      promiseRejecter: @escaping RCTPromiseRejectBlock) {
        guard let _ = config, let currOktaOidc = oktaOidc else {
            let error = OktaReactNativeError.notConfigured
            let errorDic = [
                OktaSdkConstant.ERROR_CODE_KEY: error.errorCode,
                OktaSdkConstant.ERROR_MSG_KEY: error.errorDescription
            ]
            sendEvent(withName: OktaSdkConstant.ON_ERROR, body: errorDic)
            promiseRejecter(errorDic[OktaSdkConstant.ERROR_CODE_KEY]!, 
                errorDic[OktaSdkConstant.ERROR_MSG_KEY]!, error)
            return
        }
        
        currOktaOidc.authenticate(withSessionToken: sessionToken) { stateManager, error in
            if let error = error {
                let errorDic = [
                    OktaSdkConstant.ERROR_CODE_KEY: OktaReactNativeError.oktaOidcError.errorCode,
                    OktaSdkConstant.ERROR_MSG_KEY: error.localizedDescription
                ]
                self.sendEvent(withName: OktaSdkConstant.ON_ERROR, body: errorDic)
                promiseRejecter(errorDic[OktaSdkConstant.ERROR_CODE_KEY]!, 
                    errorDic[OktaSdkConstant.ERROR_MSG_KEY]!, error)
                return
            }
            
            guard let currStateManager = stateManager else {
                let error = OktaReactNativeError.noStateManager
                let errorDic = [
                    OktaSdkConstant.ERROR_CODE_KEY: error.errorCode,
                    OktaSdkConstant.ERROR_MSG_KEY: error.errorDescription
                ]
                self.sendEvent(withName: OktaSdkConstant.ON_ERROR, body: errorDic)
                promiseRejecter(errorDic[OktaSdkConstant.ERROR_CODE_KEY]!, 
                    errorDic[OktaSdkConstant.ERROR_MSG_KEY]!, error)
                return
            }

            currStateManager.writeToSecureStorage()
            let dic = [
                OktaSdkConstant.RESOLVE_TYPE_KEY: OktaSdkConstant.AUTHORIZED,
                OktaSdkConstant.ACCESS_TOKEN_KEY: stateManager?.accessToken
            ]
            
            self.sendEvent(withName: OktaSdkConstant.SIGN_IN_SUCCESS, body: dic)
            promiseResolver(dic)
        }
    }
    
    @objc(getAccessToken:promiseRejecter:)
    func getAccessToken(promiseResolver: @escaping RCTPromiseResolveBlock, promiseRejecter: @escaping RCTPromiseRejectBlock) {
        
        guard let oidcConfig = config else {
            let error = OktaReactNativeError.notConfigured
            promiseRejecter(error.errorCode, error.errorDescription, error)
            return
        }
        
        guard let stateManager = OktaOidcStateManager.readFromSecureStorage(for: oidcConfig) else {
            let error = OktaReactNativeError.unauthenticated
            promiseRejecter(error.errorCode, error.errorDescription, error)
            return
        }
        
        let dic = [
            OktaSdkConstant.ACCESS_TOKEN_KEY: stateManager.accessToken
        ]
        
        promiseResolver(dic)
    }
    
    @objc(getIdToken:promiseRejecter:)
    func getIdToken(promiseResolver: @escaping RCTPromiseResolveBlock, promiseRejecter: @escaping RCTPromiseRejectBlock) {
        guard let oidcConfig = config else {
            let error = OktaReactNativeError.notConfigured
            promiseRejecter(error.errorCode, error.errorDescription, error)
            return
        }
        
        guard let stateManager = OktaOidcStateManager.readFromSecureStorage(for: oidcConfig) else {
            let error = OktaReactNativeError.unauthenticated
            promiseRejecter(error.errorCode, error.errorDescription, error)
            return
        }
        
        guard let idToken = stateManager.idToken else {
            let error = OktaReactNativeError.noIdToken
            promiseRejecter(error.errorCode, error.errorDescription, error)
            return
        }
        
        let dic = [
            OktaSdkConstant.ID_TOKEN_KEY: idToken
        ]
        
        promiseResolver(dic)
        return
    }
    
    @objc(getUser:promiseRejecter:)
    func getUser(promiseResolver: @escaping RCTPromiseResolveBlock, promiseRejecter: @escaping RCTPromiseRejectBlock) {
        guard let oidcConfig = config else {
            let error = OktaReactNativeError.notConfigured
            promiseRejecter(error.errorCode, error.errorDescription, error)
            return
        }
        
        guard let stateManager = OktaOidcStateManager.readFromSecureStorage(for: oidcConfig) else {
            let error = OktaReactNativeError.unauthenticated
            promiseRejecter(error.errorCode, error.errorDescription, error)
            return
        }
        
        stateManager.getUser { response, error in
            if let error = error {
                promiseRejecter(OktaReactNativeError.oktaOidcError.errorCode, error.localizedDescription, error)
                return
            }
            
            promiseResolver(response)
        }
    }
    
    @objc(isAuthenticated:promiseRejecter:)
    func isAuthenticated(promiseResolver: @escaping RCTPromiseResolveBlock, promiseRejecter: @escaping RCTPromiseRejectBlock) {
        
        guard let oidcConfig = config else {
            let error = OktaReactNativeError.notConfigured
            promiseRejecter(error.errorCode, error.errorDescription, error)
            return
        }
        
        var dic = [
            OktaSdkConstant.AUTHENTICATED_KEY: false
        ]
        
        guard let stateManager = OktaOidcStateManager.readFromSecureStorage(for: oidcConfig) else {
            promiseResolver(dic)
            return
        }
        
        if stateManager.idToken != nil || stateManager.accessToken != nil {
            dic = [
                OktaSdkConstant.AUTHENTICATED_KEY: true
            ]
        }
        
        promiseResolver(dic)
        return
    }
    
    @objc(revokeAccessToken:promiseRejecter:)
    func revokeAccessToken(promiseResolver: @escaping RCTPromiseResolveBlock, promiseRejecter: @escaping RCTPromiseRejectBlock) {
        revokeToken(tokenName: OktaSdkConstant.ACCESS_TOKEN_KEY, promiseResolver: promiseResolver, promiseRejecter: promiseRejecter)
    }
    
    @objc(revokeIdToken:promiseRejecter:)
    func revokeIdToken(promiseResolver: @escaping RCTPromiseResolveBlock, promiseRejecter: @escaping RCTPromiseRejectBlock) {
        revokeToken(tokenName: OktaSdkConstant.ID_TOKEN_KEY, promiseResolver: promiseResolver, promiseRejecter: promiseRejecter)
    }
    
    @objc(revokeRefreshToken:promiseRejecter:)
    func revokeRefreshToken(promiseResolver: @escaping RCTPromiseResolveBlock, promiseRejecter: @escaping RCTPromiseRejectBlock) {
        revokeToken(tokenName: OktaSdkConstant.REFRESH_TOKEN_KEY, promiseResolver: promiseResolver, promiseRejecter: promiseRejecter)
    }
    
    @objc(introspectAccessToken:promiseRejecter:)
    func introspectAccessToken(promiseResolver: @escaping RCTPromiseResolveBlock, promiseRejecter: @escaping RCTPromiseRejectBlock) {
        introspectToken(tokenName: OktaSdkConstant.ACCESS_TOKEN_KEY, promiseResolver: promiseResolver, promiseRejecter: promiseRejecter)
    }
    
    @objc(introspectIdToken:promiseRejecter:)
    func introspectIdToken(promiseResolver: @escaping RCTPromiseResolveBlock, promiseRejecter: @escaping RCTPromiseRejectBlock) {
        introspectToken(tokenName: OktaSdkConstant.ID_TOKEN_KEY, promiseResolver: promiseResolver, promiseRejecter: promiseRejecter)
    }
    
    @objc(introspectRefreshToken:promiseRejecter:)
    func introspectRefreshToken(promiseResolver: @escaping RCTPromiseResolveBlock, promiseRejecter: @escaping RCTPromiseRejectBlock) {
        introspectToken(tokenName: OktaSdkConstant.REFRESH_TOKEN_KEY, promiseResolver: promiseResolver, promiseRejecter: promiseRejecter)
    }
    
    @objc(refreshTokens:promiseRejecter:)
    func refreshTokens(promiseResolver: @escaping RCTPromiseResolveBlock, promiseRejecter: @escaping RCTPromiseRejectBlock) {
        
        guard let oidcConfig = config else {
            let error = OktaReactNativeError.notConfigured
            promiseRejecter(error.errorCode, error.errorDescription, error)
            return
        }
        
        guard let stateManager = OktaOidcStateManager.readFromSecureStorage(for: oidcConfig) else {
            let error = OktaReactNativeError.unauthenticated
            promiseRejecter(error.errorCode, error.errorDescription, error)
            return
        }
        
        stateManager.renew { newAccessToken, error in
            if let error = error {
                promiseRejecter(OktaReactNativeError.oktaOidcError.errorCode, error.localizedDescription, error)
                return
            }
            
            guard let newStateManager = newAccessToken else {
                let error = OktaReactNativeError.noStateManager
                promiseRejecter(error.errorCode, error.errorDescription, error)
                return
            }
            
            newStateManager.writeToSecureStorage()
            let dic = [
                OktaSdkConstant.ACCESS_TOKEN_KEY: newStateManager.accessToken,
                OktaSdkConstant.ID_TOKEN_KEY: newStateManager.idToken,
                OktaSdkConstant.REFRESH_TOKEN_KEY: newStateManager.refreshToken
            ]
            
            promiseResolver(dic)
        }
    }

    @objc(clearTokens:promiseRejecter:)
    func clearTokens(promiseResolver: @escaping RCTPromiseResolveBlock, promiseRejecter: @escaping RCTPromiseRejectBlock) {
        guard let oidcConfig = config else {
            let error = OktaReactNativeError.notConfigured
            promiseRejecter(error.errorCode, error.errorDescription, error)
            return
        }
        
        guard let stateManager = OktaOidcStateManager.readFromSecureStorage(for: oidcConfig) else {
            let error = OktaReactNativeError.unauthenticated
            promiseRejecter(error.errorCode, error.errorDescription, error)
            return
        }

        stateManager.clear()
        promiseResolver(true)
    }

    func introspectToken(tokenName: String, promiseResolver: @escaping RCTPromiseResolveBlock, promiseRejecter: @escaping RCTPromiseRejectBlock) {
        
        guard let oidcConfig = config else {
            let error = OktaReactNativeError.notConfigured
            promiseRejecter(error.errorCode, error.errorDescription, error)
            return
        }
        
        guard let stateManager = OktaOidcStateManager.readFromSecureStorage(for: oidcConfig) else {
            let error = OktaReactNativeError.unauthenticated
            promiseRejecter(error.errorCode, error.errorDescription, error)
            return
        }
        
        var token: String?
        
        switch tokenName {
        case OktaSdkConstant.ACCESS_TOKEN_KEY:
            token = stateManager.accessToken
        case OktaSdkConstant.ID_TOKEN_KEY:
            token = stateManager.idToken
        case OktaSdkConstant.REFRESH_TOKEN_KEY:
            token = stateManager.refreshToken
        default:
            let error = OktaReactNativeError.errorTokenType
            promiseRejecter(error.errorCode, error.errorDescription, error)
            return
        }
        
        stateManager.introspect(token: token, callback: { payload, error in
            if let error = error {
                promiseRejecter(OktaReactNativeError.oktaOidcError.errorCode, error.localizedDescription, error)
                return
            }
            
            guard let payload = payload else {
                let error = OktaReactNativeError.errorPayload
                promiseRejecter(error.errorCode, error.errorDescription, error)
                return
            }
            
            promiseResolver(payload)
        })
    }
    
    func revokeToken(tokenName: String, promiseResolver: @escaping RCTPromiseResolveBlock, promiseRejecter: @escaping RCTPromiseRejectBlock) {
        
        guard let oidcConfig = config else {
            let error = OktaReactNativeError.notConfigured
            promiseRejecter(error.errorCode, error.errorDescription, error)
            return
        }
        
        guard let stateManager = OktaOidcStateManager.readFromSecureStorage(for: oidcConfig) else {
            let error = OktaReactNativeError.unauthenticated
            promiseRejecter(error.errorCode, error.errorDescription, error)
            return
        }
        
        var token: String?
        
        switch tokenName {
        case OktaSdkConstant.ACCESS_TOKEN_KEY:
            token = stateManager.accessToken
        case OktaSdkConstant.ID_TOKEN_KEY:
            token = stateManager.idToken
        case OktaSdkConstant.REFRESH_TOKEN_KEY:
            token = stateManager.refreshToken
        default:
            let error = OktaReactNativeError.errorTokenType
            promiseRejecter(error.errorCode, error.errorDescription, error)
            return
        }
        
        stateManager.revoke(token) { response, error in
            if let error = error {
                promiseRejecter(OktaReactNativeError.oktaOidcError.errorCode, error.localizedDescription, error)
                return
            }
            
            promiseResolver(true)
        }
    }
    
    override
    static func requiresMainQueueSetup() -> Bool {
        return true;
    }
    
    override func supportedEvents() -> [String]! {
        return [
            OktaSdkConstant.SIGN_IN_SUCCESS,
            OktaSdkConstant.SIGN_OUT_SUCCESS,
            OktaSdkConstant.ON_ERROR,
            OktaSdkConstant.ON_CANCELLED
        ]
    }
}
