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

package com.oktareactnative;

import android.app.Activity;
import android.content.Intent;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.RCTNativeAppEventEmitter;
import com.okta.oidc.AuthorizationStatus;
import com.okta.oidc.OIDCConfig;
import com.okta.oidc.Okta;
import com.okta.oidc.RequestCallback;
import com.okta.oidc.ResultCallback;
import com.okta.oidc.Tokens;
import com.okta.oidc.results.Result;
import com.okta.oidc.clients.sessions.SessionClient;
import com.okta.oidc.clients.web.WebAuthClient;
import com.okta.oidc.clients.AuthClient;
import com.okta.oidc.net.params.TokenTypeHint;
import com.okta.oidc.net.response.IntrospectInfo;
import com.okta.oidc.net.response.UserInfo;
import com.okta.oidc.storage.SharedPreferenceStorage;
import com.okta.oidc.util.AuthorizationException;

public class OktaSdkBridgeModule extends ReactContextBaseJavaModule implements ActivityEventListener{

    private final ReactApplicationContext reactContext;
    private OIDCConfig config;
    private WebAuthClient webClient;
    private AuthClient authClient;

    public OktaSdkBridgeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.reactContext.addActivityEventListener(this);
    }

    @Override
    public String getName() {
        return "OktaSdkBridge";
    }

    @ReactMethod
    public void createConfig(String clientId,
                             String redirectUri,
                             String endSessionRedirectUri,
                             String discoveryUri,
                             ReadableArray scopes,
                             Boolean requireHardwareBackedKeyStore,
                             ReadableArray supportedBrowsers,
                             Promise promise
    ) {

        try {
            this.config = new OIDCConfig.Builder()
                    .clientId(clientId)
                    .redirectUri(redirectUri)
                    .endSessionRedirectUri(endSessionRedirectUri)
                    .scopes(this.mapReadableArrayToArray(scopes))
                    .discoveryUri(discoveryUri)
                    .create();

            this.webClient = new Okta.WebAuthBuilder()
                    .withConfig(config)
                    .withContext(reactContext)
                    .withStorage(new SharedPreferenceStorage(reactContext))
                    .setRequireHardwareBackedKeyStore(requireHardwareBackedKeyStore)
                    .supportedBrowsers(this.mapReadableArrayToArray(supportedBrowsers))
                    .create();

            this.authClient = new Okta.AuthBuilder()
                    .withConfig(config)
                    .withContext(reactContext)
                    .withStorage(new SharedPreferenceStorage(reactContext))
                    .setRequireHardwareBackedKeyStore(requireHardwareBackedKeyStore)
                    .create();

            promise.resolve(true);
        } catch (Exception e) {
            promise.reject(OktaSdkError.OKTA_OIDC_ERROR.getErrorCode(), e.getLocalizedMessage(), e);
        }
    }

    @ReactMethod
    public void signIn() {
        Activity currentActivity = getCurrentActivity();

        if (currentActivity == null) {
            final WritableMap params = Arguments.createMap();
            params.putString(OktaSdkConstant.ERROR_CODE_KEY, OktaSdkError.NO_VIEW.getErrorCode());
            params.putString(OktaSdkConstant.ERROR_MSG_KEY, OktaSdkError.NO_VIEW.getErrorMessage());
            sendEvent(reactContext, OktaSdkConstant.ON_ERROR, params);
            return;
        }

        if (webClient == null) {
            final WritableMap params = Arguments.createMap();
            params.putString(OktaSdkConstant.ERROR_CODE_KEY, OktaSdkError.NOT_CONFIGURED.getErrorCode());
            params.putString(OktaSdkConstant.ERROR_MSG_KEY, OktaSdkError.NOT_CONFIGURED.getErrorMessage());
            sendEvent(reactContext, OktaSdkConstant.ON_ERROR, params);
            return;
        }

        webClient.signIn(currentActivity, null);
    }

    @ReactMethod
    public void authenticate(String sessionToken,  final Promise promise) {
        if (authClient == null) {
            final WritableMap params = Arguments.createMap();
            params.putString(OktaSdkConstant.ERROR_CODE_KEY, OktaSdkError.NOT_CONFIGURED.getErrorCode());
            params.putString(OktaSdkConstant.ERROR_MSG_KEY, OktaSdkError.NOT_CONFIGURED.getErrorMessage());
            sendEvent(reactContext, OktaSdkConstant.ON_ERROR, params);
            promise.reject(OktaSdkError.NOT_CONFIGURED.getErrorCode(), OktaSdkError.NOT_CONFIGURED.getErrorMessage());
            return;
        }

        authClient.signIn(sessionToken, null, new RequestCallback<Result, AuthorizationException>() {
            @Override
            public void onSuccess(@NonNull Result result) {
                if (result.isSuccess()) {
                    try {
                        SessionClient sessionClient = authClient.getSessionClient();
                        Tokens tokens = sessionClient.getTokens();
                        String token = tokens.getAccessToken();

                        WritableMap params = Arguments.createMap();
                        params.putString(OktaSdkConstant.RESOLVE_TYPE_KEY, OktaSdkConstant.AUTHORIZED);
                        params.putString(OktaSdkConstant.ACCESS_TOKEN_KEY, token);
                        sendEvent(reactContext, OktaSdkConstant.SIGN_IN_SUCCESS, params);

                        params = Arguments.createMap();
                        params.putString(OktaSdkConstant.RESOLVE_TYPE_KEY, OktaSdkConstant.AUTHORIZED);
                        params.putString(OktaSdkConstant.ACCESS_TOKEN_KEY, token);
                        promise.resolve(params);
                    } catch (AuthorizationException e) {
                        WritableMap params = Arguments.createMap();
                        params.putString(OktaSdkConstant.ERROR_CODE_KEY, OktaSdkError.SIGN_IN_FAILED.getErrorCode());
                        params.putString(OktaSdkConstant.ERROR_MSG_KEY, OktaSdkError.SIGN_IN_FAILED.getErrorMessage());
                        sendEvent(reactContext, OktaSdkConstant.ON_ERROR, params);
                        promise.reject(OktaSdkError.SIGN_IN_FAILED.getErrorCode(), OktaSdkError.SIGN_IN_FAILED.getErrorMessage());
                    }
                } else {
                    WritableMap params = Arguments.createMap();
                    params.putString(OktaSdkConstant.ERROR_CODE_KEY, OktaSdkError.SIGN_IN_FAILED.getErrorCode());
                    params.putString(OktaSdkConstant.ERROR_MSG_KEY, OktaSdkError.SIGN_IN_FAILED.getErrorMessage());
                    sendEvent(reactContext, OktaSdkConstant.ON_ERROR, params);
                    promise.reject(OktaSdkError.SIGN_IN_FAILED.getErrorCode(), OktaSdkError.SIGN_IN_FAILED.getErrorMessage());
                }
            }

            @Override
            public void onError(String error, AuthorizationException exception) {
                WritableMap params = Arguments.createMap();
                params.putString(OktaSdkConstant.ERROR_CODE_KEY, OktaSdkError.OKTA_OIDC_ERROR.getErrorCode());
                params.putString(OktaSdkConstant.ERROR_MSG_KEY, error);
                sendEvent(reactContext, OktaSdkConstant.ON_ERROR, params);
                promise.reject(OktaSdkError.OKTA_OIDC_ERROR.getErrorCode(), OktaSdkError.OKTA_OIDC_ERROR.getErrorMessage());
            }
        });
    }

    @ReactMethod
    public void getAccessToken(final Promise promise) {
        try {
            if (webClient == null) {
                promise.reject(OktaSdkError.NOT_CONFIGURED.getErrorCode(), OktaSdkError.NOT_CONFIGURED.getErrorMessage());
                return;
            }

            final WritableMap params = Arguments.createMap();
            final SessionClient sessionClient = webClient.getSessionClient();
            final Tokens tokens = sessionClient.getTokens();

            if (tokens.getAccessToken() == null) {
                promise.reject(OktaSdkError.NO_ACCESS_TOKEN.getErrorCode(), OktaSdkError.NO_ACCESS_TOKEN.getErrorMessage());
                return;
            }

            params.putString(OktaSdkConstant.ACCESS_TOKEN_KEY, tokens.getAccessToken());
            promise.resolve(params);

        } catch (Exception e) {
            promise.reject(OktaSdkError.OKTA_OIDC_ERROR.getErrorCode(), e.getLocalizedMessage(), e);
        }
    }

    @ReactMethod
    public void getIdToken(Promise promise) {
        try {
            if (webClient == null) {
                promise.reject(OktaSdkError.NOT_CONFIGURED.getErrorCode(), OktaSdkError.NOT_CONFIGURED.getErrorMessage());
                return;
            }

            final WritableMap params = Arguments.createMap();
            SessionClient sessionClient = webClient.getSessionClient();
            Tokens tokens = sessionClient.getTokens();
            String idToken = tokens.getIdToken();
            if (idToken != null) {
                params.putString(OktaSdkConstant.ID_TOKEN_KEY, idToken);
                promise.resolve(params);
            } else {
                promise.reject(OktaSdkError.NO_ID_TOKEN.getErrorCode(), OktaSdkError.NO_ID_TOKEN.getErrorMessage());
            }
        } catch (Exception e) {
            promise.reject(OktaSdkError.OKTA_OIDC_ERROR.getErrorCode(), e.getLocalizedMessage(), e);
        }
    }

    @ReactMethod
    public void getUser(final Promise promise) {
        if (webClient == null) {
            promise.reject(OktaSdkError.NOT_CONFIGURED.getErrorCode(), OktaSdkError.NOT_CONFIGURED.getErrorMessage());
            return;
        }

        SessionClient sessionClient = webClient.getSessionClient();
        sessionClient.getUserProfile(new RequestCallback<UserInfo, AuthorizationException>() {
            @Override
            public void onSuccess(@NonNull UserInfo result) {
                promise.resolve(result.toString());
            }

            @Override
            public void onError(String msg, AuthorizationException error) {
                promise.reject(OktaSdkError.OKTA_OIDC_ERROR.getErrorCode(), error.getLocalizedMessage(), error);
            }
        });
    }

    @ReactMethod
    public void isAuthenticated(Promise promise) {
        try {
            if (webClient == null) {
                promise.reject(OktaSdkError.NOT_CONFIGURED.getErrorCode(), OktaSdkError.NOT_CONFIGURED.getErrorMessage());
                return;
            }

            final WritableMap params = Arguments.createMap();
            SessionClient sessionClient = webClient.getSessionClient();
            if (sessionClient.isAuthenticated()) {
                params.putBoolean(OktaSdkConstant.AUTHENTICATED_KEY, true);
            } else {
                params.putBoolean(OktaSdkConstant.AUTHENTICATED_KEY, false);
            }
            promise.resolve(params);
        } catch (Exception e) {
            promise.reject(OktaSdkError.OKTA_OIDC_ERROR.getErrorCode(), e.getLocalizedMessage(), e);
        }
    }

    @ReactMethod
    public void signOut() {
        Activity currentActivity = getCurrentActivity();

        if (currentActivity == null) {
            final WritableMap params = Arguments.createMap();
            params.putString(OktaSdkConstant.ERROR_CODE_KEY, OktaSdkError.NO_VIEW.getErrorCode());
            params.putString(OktaSdkConstant.ERROR_MSG_KEY, OktaSdkError.NO_VIEW.getErrorMessage());
            sendEvent(reactContext, OktaSdkConstant.ON_ERROR, params);
            return;
        }

        if (webClient == null) {
            final WritableMap params = Arguments.createMap();
            params.putString(OktaSdkConstant.ERROR_CODE_KEY, OktaSdkError.NOT_CONFIGURED.getErrorCode());
            params.putString(OktaSdkConstant.ERROR_MSG_KEY, OktaSdkError.NOT_CONFIGURED.getErrorMessage());
            sendEvent(reactContext, OktaSdkConstant.ON_ERROR, params);
            return;
        }

        webClient.signOutOfOkta(currentActivity);
    }

    @ReactMethod
    public void revokeAccessToken(Promise promise) {
        revokeToken(TokenTypeHint.ACCESS_TOKEN, promise);
    }

    @ReactMethod
    public void revokeIdToken(Promise promise) {
        revokeToken(TokenTypeHint.ID_TOKEN, promise);
    }

    @ReactMethod
    public void revokeRefreshToken(Promise promise) {
        revokeToken(TokenTypeHint.REFRESH_TOKEN, promise);
    }

    @ReactMethod
    public void introspectAccessToken(Promise promise) {
        introspectToken(TokenTypeHint.ACCESS_TOKEN, promise);
    }

    @ReactMethod
    public void introspectIdToken(Promise promise) {
        introspectToken(TokenTypeHint.ID_TOKEN, promise);
    }

    @ReactMethod
    public void introspectRefreshToken(Promise promise) {
        introspectToken(TokenTypeHint.REFRESH_TOKEN, promise);
    }

    @ReactMethod
    public void refreshTokens(final Promise promise) {
        try {

            if (webClient == null) {
                promise.reject(OktaSdkError.NOT_CONFIGURED.getErrorCode(), OktaSdkError.NOT_CONFIGURED.getErrorMessage());
                return;
            }

            webClient.getSessionClient().refreshToken(new RequestCallback<Tokens, AuthorizationException>() {
                @Override
                public void onSuccess(@NonNull Tokens result) {
                    WritableMap params = Arguments.createMap();
                    params.putString(OktaSdkConstant.ACCESS_TOKEN_KEY, result.getAccessToken());
                    params.putString(OktaSdkConstant.ID_TOKEN_KEY, result.getIdToken());
                    params.putString(OktaSdkConstant.REFRESH_TOKEN_KEY, result.getRefreshToken());
                    promise.resolve(params);
                }

                @Override
                public void onError(String e, AuthorizationException error) {
                    promise.reject(OktaSdkError.OKTA_OIDC_ERROR.getErrorCode(), error.getLocalizedMessage(), error);
                }
            });
        } catch (Error e) {
            promise.reject(OktaSdkError.OKTA_OIDC_ERROR.getErrorCode(), e.getLocalizedMessage(), e);
        }
    }

    @ReactMethod
    public void clearTokens(final Promise promise) {
        try {
            if (webClient != null) {
                webClient.getSessionClient().clear();
            }

            if (authClient != null) {
                authClient.getSessionClient().clear();
            }
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject(OktaSdkError.OKTA_OIDC_ERROR.getErrorCode(), e.getLocalizedMessage(), e);
        }
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        webClient.handleActivityResult(requestCode & 0xffff, resultCode, data);
        Activity currentActivity = getCurrentActivity();
        registerCallback(currentActivity);
    }

    @Override
    public void onNewIntent(Intent intent) {

    }

    /** ================= Private Methods ================= **/

    private void sendEvent(ReactContext reactContext,
                           String eventName,
                           @Nullable WritableMap params) {
        reactContext
                .getJSModule(RCTNativeAppEventEmitter.class)
                .emit(eventName, params);
    }

    private void registerCallback(Activity activity) {
        final SessionClient sessionClient = webClient.getSessionClient();

        webClient.registerCallback(new ResultCallback<AuthorizationStatus, AuthorizationException>() {
            @Override
            public void onSuccess(@NonNull AuthorizationStatus status) {
                if (status == AuthorizationStatus.AUTHORIZED) {
                    try {
                        WritableMap params = Arguments.createMap();
                        Tokens tokens = sessionClient.getTokens();
                        params.putString(OktaSdkConstant.RESOLVE_TYPE_KEY, OktaSdkConstant.AUTHORIZED);
                        params.putString(OktaSdkConstant.ACCESS_TOKEN_KEY, tokens.getAccessToken());
                        sendEvent(reactContext, OktaSdkConstant.SIGN_IN_SUCCESS, params);
                    } catch (AuthorizationException e) {
                        WritableMap params = Arguments.createMap();
                        params.putString(OktaSdkConstant.ERROR_CODE_KEY, OktaSdkError.SIGN_IN_FAILED.getErrorCode());
                        params.putString(OktaSdkConstant.ERROR_MSG_KEY, OktaSdkError.SIGN_IN_FAILED.getErrorMessage());
                        sendEvent(reactContext, OktaSdkConstant.ON_ERROR, params);
                    }
                } else if (status == AuthorizationStatus.SIGNED_OUT) {
                    sessionClient.clear();
                    WritableMap params = Arguments.createMap();
                    params.putString(OktaSdkConstant.RESOLVE_TYPE_KEY, OktaSdkConstant.SIGNED_OUT);
                    sendEvent(reactContext, OktaSdkConstant.SIGN_OUT_SUCCESS, params);
                }
            }

            @Override
            public void onCancel() {
                WritableMap params = Arguments.createMap();
                params.putString(OktaSdkConstant.RESOLVE_TYPE_KEY, OktaSdkConstant.CANCELLED);
                sendEvent(reactContext, OktaSdkConstant.ON_CANCELLED, params);
            }

            @Override
            public void onError(@NonNull String msg, AuthorizationException error) {
                WritableMap params = Arguments.createMap();
                params.putString(OktaSdkConstant.ERROR_CODE_KEY, OktaSdkError.OKTA_OIDC_ERROR.getErrorCode());
                params.putString(OktaSdkConstant.ERROR_MSG_KEY, msg);
                sendEvent(reactContext, OktaSdkConstant.ON_ERROR, params);
            }
        }, activity);
    }

    private void revokeToken(String tokenName, final Promise promise) {
        try {
            if (webClient == null) {
                promise.reject(OktaSdkError.NOT_CONFIGURED.getErrorCode(), OktaSdkError.NOT_CONFIGURED.getErrorMessage());
                return;
            }

            final SessionClient sessionClient = webClient.getSessionClient();
            Tokens tokens = sessionClient.getTokens();
            String token;

            switch (tokenName) {
                case TokenTypeHint.ACCESS_TOKEN:
                    token = tokens.getAccessToken();
                    break;
                case TokenTypeHint.ID_TOKEN:
                    token = tokens.getIdToken();
                    break;
                case TokenTypeHint.REFRESH_TOKEN:
                    token = tokens.getRefreshToken();
                    break;
                default:
                    promise.reject(OktaSdkError.ERROR_TOKEN_TYPE.getErrorCode(), OktaSdkError.ERROR_TOKEN_TYPE.getErrorMessage());
                    return;
            }

            sessionClient.revokeToken(token,
                    new RequestCallback<Boolean, AuthorizationException>() {
                        @Override
                        public void onSuccess(@NonNull Boolean result) {
                            promise.resolve(result);
                        }
                        @Override
                        public void onError(String msg, AuthorizationException error) {
                            promise.reject(OktaSdkError.OKTA_OIDC_ERROR.getErrorCode(), error.getLocalizedMessage(), error);
                        }
                    });
        } catch (Exception e) {
            promise.reject(OktaSdkError.OKTA_OIDC_ERROR.getErrorCode(), e.getLocalizedMessage(), e);
        }
    }

    private void introspectToken(String tokenName, final Promise promise) {
        try {
            if (webClient == null) {
                promise.reject(OktaSdkError.NOT_CONFIGURED.getErrorCode(), OktaSdkError.NOT_CONFIGURED.getErrorMessage());
            }

            final SessionClient sessionClient = webClient.getSessionClient();
            Tokens tokens = sessionClient.getTokens();
            String token;

            switch (tokenName) {
                case TokenTypeHint.ACCESS_TOKEN:
                    token = tokens.getAccessToken();
                    break;
                case TokenTypeHint.ID_TOKEN:
                    token = tokens.getIdToken();
                    break;
                case TokenTypeHint.REFRESH_TOKEN:
                    token = tokens.getRefreshToken();
                    break;
                default:
                    promise.reject(OktaSdkError.ERROR_TOKEN_TYPE.getErrorCode(), OktaSdkError.ERROR_TOKEN_TYPE.getErrorMessage());
                    return;
            }

            webClient.getSessionClient().introspectToken(token,
                    tokenName, new RequestCallback<IntrospectInfo, AuthorizationException>() {
                        @Override
                        public void onSuccess(@NonNull IntrospectInfo result) {
                            WritableMap params = Arguments.createMap();
                            params.putBoolean(OktaSdkConstant.ACTIVE_KEY, result.isActive());
                            params.putString(OktaSdkConstant.TOKEN_TYPE_KEY, result.getTokenType());
                            params.putString(OktaSdkConstant.SCOPE_KEY, result.getScope());
                            params.putString(OktaSdkConstant.CLIENT_ID_KEY, result.getClientId());
                            params.putString(OktaSdkConstant.DEVICE_ID_KEY, result.getDeviceId());
                            params.putString(OktaSdkConstant.USERNAME_KEY, result.getUsername());
                            params.putInt(OktaSdkConstant.NBF_KEY, result.getNbf());
                            params.putInt(OktaSdkConstant.EXP_KEY, result.getExp());
                            params.putInt(OktaSdkConstant.IAT_KEY, result.getIat());
                            params.putString(OktaSdkConstant.SUB_KEY, result.getSub());
                            params.putString(OktaSdkConstant.AUD_KEY, result.getAud());
                            params.putString(OktaSdkConstant.ISS_KEY, result.getIss());
                            params.putString(OktaSdkConstant.JTI_KEY, result.getJti());
                            params.putString(OktaSdkConstant.UID_KEY, result.getUid());
                            promise.resolve(params);
                        }

                        @Override
                        public void onError(String e, AuthorizationException error) {
                            promise.reject(OktaSdkError.OKTA_OIDC_ERROR.getErrorCode(), error.getLocalizedMessage(), error);
                        }
                    }
            );
        } catch (AuthorizationException e) {
            promise.reject(OktaSdkError.OKTA_OIDC_ERROR.getErrorCode(), e.getLocalizedMessage(), e);
        }
    }

    private String[] mapReadableArrayToArray(ReadableArray readableArray) {
        if (readableArray == null) {
            return new String[0];
        }

        int size = readableArray.size();
        String[] array = new String[size];

        for (int i = 0; i < size; i++) {
            array[i] = readableArray.getString(i);
        }
        return array;
    }
}
