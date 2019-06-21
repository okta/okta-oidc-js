//
//  OktaSdkBridge.swift
//  OktaSdkBridge
//
//  Created by Kayci Wang on 6/14/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

import Foundation
import OktaOidc

public enum OktaReactNativeError: Error {
    case notConfigured
    case noView
    case unauthenticated
    case noStateManager
    case noIdToken
}

extension OktaReactNativeError: LocalizedError {
    public var errorDescription: String? {
        switch self {
        case .notConfigured:
            return NSLocalizedString("OktaOidc client isn't configured, check if you have created a configuration with createConfig", comment: "")
        case .noView:
            return NSLocalizedString("No current view exists", comment: "")
        case .unauthenticated:
            return NSLocalizedString("User is not authenticated, cannot perform the specific action", comment: "")
        case .noStateManager:
            return NSLocalizedString("State Manager does not exist.", comment: "")
        case .noIdToken:
            return NSLocalizedString("Id token does not exist", comment: "")
        }
    }
}


@objc(OktaSdkBridge)
class OktaSdkBridge: NSObject {
    
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
            promiseResolver("Config created successfully")
        } catch let error {
            promiseRejecter("2000", error.localizedDescription, error)
        }
    }
    
    @objc(signIn:promiseRejecter:)
    func signIn(_ promiseResolver: @escaping RCTPromiseResolveBlock, promiseRejecter: @escaping RCTPromiseRejectBlock) {
        
        let view = RCTPresentedViewController();
        
        guard let currOktaOidc = oktaOidc else {
            let error = OktaOidcError.notConfigured
            promiseRejecter("2000", error.errorDescription, error)
            return
        }
        
        guard let currView = view else {
            let error = OktaReactNativeError.noView
            promiseRejecter("2000", error.errorDescription, error)
            return
        }
        
        currOktaOidc.signInWithBrowser(from: currView) { stateManager, error in
            if let error = error {
                promiseRejecter("2000", error.localizedDescription, error)
                return
            }
            
            guard let currStateManager = stateManager else {
                let error = OktaReactNativeError.noStateManager
                promiseRejecter("2000", error.errorDescription, error)
                return
            }
            
            currStateManager.writeToSecureStorage()
            let dic = [
                "resolve_type": "authorized",
                "access_token": stateManager?.accessToken
            ]
            
            promiseResolver(dic)
        }
    }
    
    @objc(signOut:promiseRejecter:)
    func signOut(_ promiseResolver: @escaping RCTPromiseResolveBlock, promiseRejecter: @escaping RCTPromiseRejectBlock) {
        
        let view = RCTPresentedViewController();
        
        guard let oidcConfig = config, let currOktaOidc = oktaOidc else {
            let error = OktaOidcError.notConfigured
            promiseRejecter("2000", error.errorDescription, error)
            return
        }
        
        guard let currView = view else {
            let error = OktaReactNativeError.noView
            promiseRejecter("2000", error.errorDescription, error)
            return
        }
        
        guard let stateManager = OktaOidcStateManager.readFromSecureStorage(for: oidcConfig) else {
            let error = OktaReactNativeError.unauthenticated
            promiseRejecter("2000", error.errorDescription, error)
            return
        }
        
        currOktaOidc.signOutOfOkta(stateManager, from: currView) { error in
            if let error = error {
                promiseRejecter("2000", error.localizedDescription, error)
                return
            }
            
            let dic = [
                "resolve_type": "signedOut"
            ]
            stateManager.clear()
            promiseResolver(dic)
        }
    }
    
    @objc(getAccessToken:promiseRejecter:)
    func getAccessToken(promiseResolver: @escaping RCTPromiseResolveBlock, promiseRejecter: @escaping RCTPromiseRejectBlock) {
        
        guard let oidcConfig = config else {
            let error = OktaOidcError.notConfigured
            promiseRejecter("2000", error.errorDescription, error)
            return
        }
        
        guard let stateManager = OktaOidcStateManager.readFromSecureStorage(for: oidcConfig) else {
            let error = OktaReactNativeError.unauthenticated
            promiseRejecter("2000", error.errorDescription, error)
            return
        }
        
        stateManager.introspect(token: stateManager.accessToken, callback: { payload, error in
            guard let payload = payload, let isValid = payload["active"] as? Bool else {
                //TODO :ERROR
                let error = OktaReactNativeError.unauthenticated
                promiseRejecter("2000", error.errorDescription, error)
                return
            }
            
            var dic = [
                "access_token": stateManager.accessToken
            ]
            
            if !isValid {
                stateManager.renew { newAccessToken, error in
                    if let error = error {
                        promiseRejecter("2000", error.localizedDescription, error)
                        return
                    }
                    
                    guard let newStateManager = newAccessToken else {
                        let error = OktaReactNativeError.noStateManager
                        promiseRejecter("2000", error.errorDescription, error)
                        return
                    }
                    
                    dic = [
                        "access_token": newStateManager.accessToken
                    ]
                }
            }
            promiseResolver(dic)
        })
    }
    
    @objc(getIdToken:promiseRejecter:)
    func getIdToken(promiseResolver: @escaping RCTPromiseResolveBlock, promiseRejecter: @escaping RCTPromiseRejectBlock) {
        guard let oidcConfig = config else {
            let error = OktaOidcError.notConfigured
            promiseRejecter("2000", error.errorDescription, error)
            return
        }
        
        guard let stateManager = OktaOidcStateManager.readFromSecureStorage(for: oidcConfig) else {
            let error = OktaReactNativeError.unauthenticated
            promiseRejecter("2000", error.errorDescription, error)
            return
        }
        
        guard let idToken = stateManager.idToken else {
            let error = OktaReactNativeError.noIdToken
            promiseRejecter("2000", error.errorDescription, error)
            return
        }
        
        let dic = [
            "id_token": idToken
        ]
        
        promiseResolver(dic)
    }
    
    @objc(getUser:promiseRejecter:)
    func getUser(promiseResolver: @escaping RCTPromiseResolveBlock, promiseRejecter: @escaping RCTPromiseRejectBlock) {
        guard let oidcConfig = config else {
            let error = OktaOidcError.notConfigured
            promiseRejecter("2000", error.errorDescription, error)
            return
        }
        
        guard let stateManager = OktaOidcStateManager.readFromSecureStorage(for: oidcConfig) else {
            let error = OktaReactNativeError.unauthenticated
            promiseRejecter("2000", error.errorDescription, error)
            return
        }
        
        stateManager.getUser { response, error in
            if let error = error {
                promiseRejecter("2000", error.localizedDescription, error)
                return
            }
            
            promiseResolver(response)
        }
    }
    
    @objc(isAuthenticated:promiseRejecter:)
    func isAuthenticated(promiseResolver: @escaping RCTPromiseResolveBlock, promiseRejecter: @escaping RCTPromiseRejectBlock) {
        
        guard let oidcConfig = config else {
            let error = OktaOidcError.notConfigured
            promiseRejecter("2000", error.errorDescription, error)
            return
        }
        
        var dic = [
            "authenticated": false
        ]
        
        guard let stateManager = OktaOidcStateManager.readFromSecureStorage(for: oidcConfig) else {
            promiseResolver(dic)
            return
        }
        
        if stateManager.idToken != nil || stateManager.accessToken != nil {
            dic = [
                "authenticated": true
            ]
        }
        
        promiseResolver(dic)
    }
}
