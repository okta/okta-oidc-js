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

struct OktaSdkConstant {
    /** ======== Keys ======== **/
    static let RESOLVE_TYPE_KEY = "resolve_type"
    static let ACCESS_TOKEN_KEY = "access_token"
    static let ID_TOKEN_KEY = "id_token"
    static let REFRESH_TOKEN_KEY = "refresh_token"
    static let AUTHENTICATED_KEY = "authenticated"
    static let ERROR_CODE_KEY = "error_code";
    static let ERROR_MSG_KEY = "error_message";
    
    /** ======== Values ======== **/
    static let AUTHORIZED = "authorized"
    static let SIGNED_OUT = "signed_out"
    static let CANCELLED = "cancelled"
    
    /** ======== Event names ======== **/
    static let SIGN_IN_SUCCESS = "signInSuccess";
    static let ON_ERROR = "onError";
    static let SIGN_OUT_SUCCESS = "signOutSuccess";
    static let ON_CANCELLED = "onCancelled";
}
