package com.oktareactnative;

import android.app.Activity;
import android.content.Intent;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.v4.app.FragmentActivity;
import android.support.v7.app.AppCompatActivity;

import com.facebook.react.ReactActivity;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.okta.oidc.AuthorizationStatus;
import com.okta.oidc.OIDCConfig;
import com.okta.oidc.Okta;
import com.okta.oidc.ResultCallback;
import com.okta.oidc.Tokens;
import com.okta.oidc.clients.sessions.SessionClient;
import com.okta.oidc.clients.web.WebAuthClient;
import com.okta.oidc.storage.SharedPreferenceStorage;
import com.okta.oidc.util.AuthorizationException;

public class OktaSdkBridgeModule extends ReactContextBaseJavaModule {

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
    public void sampleMethod(String stringArgument, int numberArgument, Callback callback) {
        // TODO: Implement some real useful functionality
        callback.invoke("Received numberArgument: " + numberArgument + " stringArgument: " + stringArgument);
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
                    .create();

            promise.resolve("Config has been set up successfully.");
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void signIn(final Promise promise) {
        try {
            FragmentActivity currentActivity = (FragmentActivity) getCurrentActivity();

            final SessionClient sessionClient = webClient.getSessionClient();
            final WritableMap params = Arguments.createMap();

            webClient.registerCallback(new ResultCallback<AuthorizationStatus, AuthorizationException>() {
                @Override
                public void onSuccess(@NonNull AuthorizationStatus status) {
                    if (status == AuthorizationStatus.AUTHORIZED) {
                        try {
                            Tokens tokens = sessionClient.getTokens();
                            params.putString("resolveType", "authorized");
                            params.putString("accessToken", tokens.getAccessToken());
                            promise.resolve(params);
                        } catch (AuthorizationException e) {
                            promise.reject(e);
                        }
                    } else if (status == AuthorizationStatus.SIGNED_OUT) {
                        params.putString("resolveType", "signedOut");
                        promise.resolve(params);
                    }
                }

                @Override
                public void onCancel() {
                    params.putString("resolveType", "cancelled");
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

//    @ReactMethod
//    public void signOut(final Promise promise) {
//        this.currentActivity = (FragmentActivity) getCurrentActivity();
//
//        final SessionClient sessionClient = webClient.getSessionClient();
//        final WritableMap params = Arguments.createMap();
//
//        webClient.registerCallback(new ResultCallback<AuthorizationStatus, AuthorizationException>() {
//            @Override
//            public void onSuccess(@NonNull AuthorizationStatus status) {
//                if (status == AuthorizationStatus.AUTHORIZED) {
//                    try {
//                        Tokens tokens = sessionClient.getTokens();
//                        params.putString("resolveType", "authorized");
//                        params.putString("accessToken", tokens.getAccessToken());
//                        promise.resolve(params);
//                    } catch (AuthorizationException e) {
//                        promise.reject(e);
//                    }
//                } else if (status == AuthorizationStatus.SIGNED_OUT) {
//                    params.putString("resolveType", "signedOut");
//                    promise.resolve(params);
//                }
//            }
//
//            @Override
//            public void onCancel() {
//                params.putString("resolveType", "cancelled");
//                promise.resolve(params);
//            }
//
//            @Override
//            public void onError(@NonNull String msg, AuthorizationException error) {
//                promise.reject(error);
//            }
//        }, currentActivity);
//
//        webClient.signOutOfOkta(currentActivity);
//    }
}
