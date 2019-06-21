#import "ReactNativeOktaSdkBridge-Bridging-Header.h"

@interface RCT_EXTERN_MODULE(OktaSdkBridge, NSObject)

RCT_EXTERN_METHOD(createConfig:(NSString *)clientId redirectUrl:(NSString *)redirectUrl endSessionRedirectUri:(NSString *)endSessionRedirectUri discoveryUri:(NSString *)discoveryUri scopes:(NSString *)scopes promiseResolver:(RCTPromiseResolveBlock *)promiseResolver promiseRejecter:(RCTPromiseRejectBlock *)promiseRejecter)

RCT_EXTERN_METHOD(signIn:(RCTPromiseResolveBlock *)promiseResolver promiseRejecter:(RCTPromiseRejectBlock *)promiseRejecter)

RCT_EXTERN_METHOD(signOut:(RCTPromiseResolveBlock *)promiseResolver promiseRejecter:(RCTPromiseRejectBlock *)promiseRejecter)

RCT_EXTERN_METHOD(getAccessToken:(RCTPromiseResolveBlock *)promiseResolver promiseRejecter:(RCTPromiseRejectBlock *)promiseRejecter)

RCT_EXTERN_METHOD(getIdToken:(RCTPromiseResolveBlock *)promiseResolver promiseRejecter:(RCTPromiseRejectBlock *)promiseRejecter)

RCT_EXTERN_METHOD(getUser:(RCTPromiseResolveBlock *)promiseResolver promiseRejecter:(RCTPromiseRejectBlock *)promiseRejecter)

RCT_EXTERN_METHOD(isAuthenticated:(RCTPromiseResolveBlock *)promiseResolver promiseRejecter:(RCTPromiseRejectBlock *)promiseRejecter)

@end
