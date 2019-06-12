package com.oktareactnative;

import android.app.Activity;
import android.content.Intent;

import androidx.annotation.NonNull;

import com.facebook.react.ReactActivity;
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
                    .setRequireHardwareBackedKeyStore(false) // TODO: remember to set it to true when releasing SDK
                    .create();

            promise.resolve("Config has been set up successfully.");
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void signIn(final Promise promise) {
        try {
            ReactActivity currentActivity = (ReactActivity) getCurrentActivity();

            if (currentActivity == null) {
                promise.reject("1000","No activity is available");
            }

            final SessionClient sessionClient = webClient.getSessionClient();
            final WritableMap params = Arguments.createMap();

            webClient.registerCallback(new ResultCallback<AuthorizationStatus, AuthorizationException>() {
                @Override
                public void onSuccess(@NonNull AuthorizationStatus status) {
                    if (status == AuthorizationStatus.AUTHORIZED) {
                        try {
                            Tokens tokens = sessionClient.getTokens();
                            params.putString("resolve_type", "authorized");
                            params.putString("access_token", tokens.getAccessToken());
                            promise.resolve(params);
                        } catch (AuthorizationException e) {
                            promise.reject(e);
                        }
                    } else if (status == AuthorizationStatus.SIGNED_OUT) {
                        params.putString("resolve_type", "signedOut");
                        promise.resolve(params);
                    }
                }

                @Override
                public void onCancel() {
                    params.putString("resolve_type", "cancelled");
                    promise.resolve(params);
                }

                @Override
                public void onError(@NonNull String msg, AuthorizationException error) {
                    promise.reject(error);
                }
            }, currentActivity);

            webClient.signIn(currentActivity, null);
        } catch (Error e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void getAccessToken(final Promise promise) {
        try {
            final WritableMap params = Arguments.createMap();
            final SessionClient sessionClient = webClient.getSessionClient();
            final Tokens tokens = sessionClient.getTokens();

            if (tokens.isAccessTokenExpired()) {
                webClient.getSessionClient().refreshToken(new RequestCallback<Tokens, AuthorizationException>() {
                    @Override
                    public void onSuccess(@NonNull Tokens result) {
                        params.putString("access_token", tokens.getAccessToken());
                        promise.resolve(params);
                    }

                    @Override
                    public void onError(String error, AuthorizationException exception) {
                        promise.reject(exception);
                    }
                });
            } else {
                params.putString("access_token", tokens.getAccessToken());
                promise.resolve(params);
            }
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void getIdToken(Promise promise) {
        try {
            final WritableMap params = Arguments.createMap();
            SessionClient sessionClient = webClient.getSessionClient();
            Tokens tokens = sessionClient.getTokens();
            String idToken = tokens.getIdToken();
            if (idToken != null) {
                params.putString("id_token", idToken);
                promise.resolve(params);
            } else {
                promise.reject("1002", "ID Token does not exist");
            }
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void getUser(final Promise promise) {
        SessionClient sessionClient = webClient.getSessionClient();
        sessionClient.getUserProfile(new RequestCallback<UserInfo, AuthorizationException>() {
            @Override
            public void onSuccess(@NonNull UserInfo result) {
                promise.resolve(result.toString());
            }

            @Override
            public void onError(String error, AuthorizationException exception) {
                promise.reject(exception);
            }
        });
    }

    @ReactMethod
    public void isAuthenticated(Promise promise) {
        try {
            final WritableMap params = Arguments.createMap();
            SessionClient sessionClient = webClient.getSessionClient();
            if (sessionClient.isAuthenticated()) {
                params.putBoolean("authenticated", true);
            } else {
                params.putBoolean("authenticated", false);
            }
            promise.resolve(params);
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void signOut(final Promise promise) {
        try {
            ReactActivity currentActivity = (ReactActivity) getCurrentActivity();

            if (currentActivity == null) {
                promise.reject("1000","No activity is available");
            }

            final SessionClient sessionClient = webClient.getSessionClient();
            final WritableMap params = Arguments.createMap();

            webClient.registerCallback(new ResultCallback<AuthorizationStatus, AuthorizationException>() {
                @Override
                public void onSuccess(@NonNull AuthorizationStatus status) {
                    if (status == AuthorizationStatus.AUTHORIZED) {
                        try {
                            Tokens tokens = sessionClient.getTokens();
                            params.putString("resolve_type", "authorized");
                            params.putString("access_token", tokens.getAccessToken());
                            promise.resolve(params);
                        } catch (AuthorizationException e) {
                            promise.reject(e);
                        }
                    } else if (status == AuthorizationStatus.SIGNED_OUT) {
                        sessionClient.clear();
                        params.putString("resolve_type", "signedOut");
                        promise.resolve(params);
                    }
                }

                @Override
                public void onCancel() {
                    params.putString("resolve_type", "cancelled");
                    promise.resolve(params);
                }

                @Override
                public void onError(@NonNull String msg, AuthorizationException error) {
                    promise.reject(error);
                }
            }, currentActivity);

            webClient.signOutOfOkta(currentActivity);
        } catch (Error e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void revokeAccessToken(Promise promise) {
        revokeToken("access", promise);
    }

    @ReactMethod
    public void revokeIdToken(Promise promise) {
        revokeToken("id", promise);
    }

    @ReactMethod
    public void revokeRefreshToken(Promise promise) {
        revokeToken("refresh", promise);
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
    }

    @Override
    public void onNewIntent(Intent intent) {

    }

    private void revokeToken(String tokenName, final Promise promise) {
        try {
            final SessionClient sessionClient = webClient.getSessionClient();
            Tokens tokens = sessionClient.getTokens();
            String token;

            switch (tokenName) {
                case "access":
                    token = tokens.getAccessToken();
                    break;
                case "id":
                    token = tokens.getIdToken();
                    break;
                case "refresh":
                    token = tokens.getRefreshToken();
                    break;
                default:
                    throw new Exception("Token type not found.");
            }

            sessionClient.revokeToken(token,
                    new RequestCallback<Boolean, AuthorizationException>() {
                        @Override
                        public void onSuccess(@NonNull Boolean result) {
                            promise.resolve(result);
                        }
                        @Override
                        public void onError(String error, AuthorizationException exception) {
                            promise.reject(exception);
                        }
                    });
        } catch (Exception e) {
            promise.reject(e);
        }
    }
}
