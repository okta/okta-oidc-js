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

public enum OktaSdkError {
    NOT_CONFIGURED("-100", "OktaOidc client isn't configured, check if you have created a configuration with createConfig"),
    NO_VIEW("-200", "No current view exists"),
    NO_ID_TOKEN("-500", "Id token does not exist"),
    OKTA_OIDC_ERROR("-600", "Okta Oidc error"),
    ERROR_TOKEN_TYPE("-700", "Token type not found"),
    NO_ACCESS_TOKEN("-900", "No access token found"),
    SIGN_IN_FAILED("-1000", "Sign in was not authorized");

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
