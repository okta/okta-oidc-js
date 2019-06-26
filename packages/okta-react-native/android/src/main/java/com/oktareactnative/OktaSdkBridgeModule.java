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

import android.support.annotation.NonNull;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableMap;
import com.okta.oidc.AuthorizationStatus;
import com.okta.oidc.OIDCConfig;
import com.okta.oidc.Okta;
import com.okta.oidc.RequestCallback;
import com.okta.oidc.ResultCallback;
import com.okta.oidc.Tokens;
import com.okta.oidc.clients.sessions.SessionClient;
import com.okta.oidc.clients.web.WebAuthClient;
import com.okta.oidc.net.params.TokenTypeHint;
import com.okta.oidc.net.response.IntrospectInfo;
import com.okta.oidc.net.response.UserInfo;
import com.okta.oidc.storage.SharedPreferenceStorage;
import com.okta.oidc.util.AuthorizationException;

public class OktaSdkBridgeModule extends ReactContextBaseJavaModule implements ActivityEventListener {

    private final ReactApplicationContext reactContext;
    private OIDCConfig config;
    private WebAuthClient webClient;

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
                             Promise promise
    ) {

        try {
            String[] scopeArray = new String[scopes.size()];

            for (int i = 0; i < scopes.size(); i++) {
                scopeArray[i] = scopes.getString(i);
            }

            this.config = new OIDCConfig.Builder()
                    .clientId(clientId)
                    .redirectUri(redirectUri)
                    .endSessionRedirectUri(endSessionRedirectUri)
                    .scopes(scopeArray)
                    .discoveryUri(discoveryUri)
                    .create();

            this.webClient = new Okta.WebAuthBuilder()
                    .withConfig(config)
                    .withContext(reactContext)
                    .withStorage(new SharedPreferenceStorage(reactContext))
                    .setRequireHardwareBackedKeyStore(true) // TODO: remember to set it to true when releasing SDK
                    .create();

            promise.resolve(true);
        } catch (Exception e) {
            promise.reject(OktaSdkError.OKTA_OIDC_ERROR.getErrorCode(), e.getLocalizedMessage(), e);
        }
    }

    @ReactMethod
    public void signIn(final Promise promise) {
        try {
            Activity currentActivity = getCurrentActivity();

            if (currentActivity == null) {
                promise.reject(OktaSdkError.NO_VIEW.getErrorCode(), OktaSdkError.NO_VIEW.getErrorMessage());
                return;
            }

            if (webClient == null) {
                promise.reject(OktaSdkError.NOT_CONFIGURED.getErrorCode(), OktaSdkError.NOT_CONFIGURED.getErrorMessage());
                return;
            }

            final SessionClient sessionClient = webClient.getSessionClient();
            final WritableMap params = Arguments.createMap();

            webClient.registerCallback(new ResultCallback<AuthorizationStatus, AuthorizationException>() {
                @Override
                public void onSuccess(@NonNull AuthorizationStatus status) {
                    if (status == AuthorizationStatus.AUTHORIZED) {
                        try {
                            Tokens tokens = sessionClient.getTokens();
                            params.putString(OktaSdkConstant.RESOLVE_TYPE_KEY, OktaSdkConstant.AUTHORIZED);
                            params.putString(OktaSdkConstant.ACCESS_TOKEN_KEY, tokens.getAccessToken());
                            promise.resolve(params);
                        } catch (AuthorizationException e) {
                            promise.reject(OktaSdkError.OKTA_OIDC_ERROR.getErrorCode(), e.getLocalizedMessage(), e);
                        }
                    } else if (status == AuthorizationStatus.SIGNED_OUT) {
                        params.putString(OktaSdkConstant.RESOLVE_TYPE_KEY, OktaSdkConstant.SIGNED_OUT);
                        promise.resolve(params);
                    }
                }

                @Override
                public void onCancel() {
                    params.putString(OktaSdkConstant.RESOLVE_TYPE_KEY, OktaSdkConstant.CANCELLED);
                    promise.resolve(params);
                }

                @Override
                public void onError(@NonNull String msg, AuthorizationException error) {
                    promise.reject(OktaSdkError.OKTA_OIDC_ERROR.getErrorCode(), error.getLocalizedMessage(), error);
                }
            }, currentActivity);

            webClient.signIn(currentActivity, null);
        } catch (Error e) {
            promise.reject(OktaSdkError.OKTA_OIDC_ERROR.getErrorCode(), e.getLocalizedMessage(), e);
        }
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
    public void signOut(final Promise promise) {
        try {
            Activity currentActivity = getCurrentActivity();

            if (currentActivity == null) {
                promise.reject(OktaSdkError.NO_VIEW.getErrorCode(), OktaSdkError.NO_VIEW.getErrorMessage());
                return;
            }

            if (webClient == null) {
                promise.reject(OktaSdkError.NOT_CONFIGURED.getErrorCode(), OktaSdkError.NOT_CONFIGURED.getErrorMessage());
                return;
            }

            final SessionClient sessionClient = webClient.getSessionClient();
            final WritableMap params = Arguments.createMap();

            webClient.registerCallback(new ResultCallback<AuthorizationStatus, AuthorizationException>() {
                @Override
                public void onSuccess(@NonNull AuthorizationStatus status) {
                    if (status == AuthorizationStatus.AUTHORIZED) {
                        try {
                            Tokens tokens = sessionClient.getTokens();
                            params.putString(OktaSdkConstant.RESOLVE_TYPE_KEY, OktaSdkConstant.AUTHORIZED);
                            params.putString(OktaSdkConstant.ACCESS_TOKEN_KEY, tokens.getAccessToken());
                            promise.resolve(params);
                        } catch (AuthorizationException e) {
                            promise.reject(OktaSdkError.OKTA_OIDC_ERROR.getErrorCode(), e.getLocalizedMessage(), e);
                        }
                    } else if (status == AuthorizationStatus.SIGNED_OUT) {
                        sessionClient.clear();
                        params.putString(OktaSdkConstant.RESOLVE_TYPE_KEY, OktaSdkConstant.SIGNED_OUT);
                        promise.resolve(params);
                    }
                }

                @Override
                public void onCancel() {
                    params.putString(OktaSdkConstant.RESOLVE_TYPE_KEY, OktaSdkConstant.CANCELLED);
                    promise.resolve(params);
                }

                @Override
                public void onError(@NonNull String msg, AuthorizationException error) {
                    promise.reject(OktaSdkError.OKTA_OIDC_ERROR.getErrorCode(), error.getLocalizedMessage(), error);
                }
            }, currentActivity);

            webClient.signOutOfOkta(currentActivity);
        } catch (Error e) {
            promise.reject(OktaSdkError.OKTA_OIDC_ERROR.getErrorCode(), e.getLocalizedMessage(), e);
        }
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

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        webClient.handleActivityResult(requestCode & 0xffff, resultCode, data);
    }

    @Override
    public void onNewIntent(Intent intent) {

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
}
