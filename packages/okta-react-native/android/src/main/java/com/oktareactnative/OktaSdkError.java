package com.oktareactnative;

public enum OktaSdkError {
    NOT_CONFIGURED("-100", "OktaOidc client isn't configured, check if you have created a configuration with createConfig"),
    NO_VIEW("-200", "No current view exists"),
    NO_ID_TOKEN("-500", "Id token does not exist"),
    OKTA_OIDC_ERROR("-600", "Okta Oidc error"),
    ERROR_TOKEN_TYPE("-700", "Token type not found");

    private final String errorCode;
    private final String errorMessage;

    OktaSdkError(String errorCode, String errorMessage) {
        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
    }

    String getErrorCode() {
        return errorCode;
    }

    String getErrorMessage() {
        return errorMessage;
    }

}
