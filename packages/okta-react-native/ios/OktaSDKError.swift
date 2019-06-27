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

public enum OktaReactNativeError: Error {
    case notConfigured
    case noView
    case unauthenticated
    case noStateManager
    case noIdToken
    case oktaOidcError
    case errorTokenType
    case errorPayload
    case noAccessToken
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
        case .oktaOidcError:
            return NSLocalizedString("Okta Oidc error", comment: "")
        case .errorTokenType:
            return NSLocalizedString("Token type not found", comment: "")
        case .errorPayload:
            return NSLocalizedString("Error in retrieving payload", comment: "")
        case .noAccessToken:
            return NSLocalizedString("No access token found", comment: "")
        }
    }
    public var errorCode: String? {
        switch self {
        case .notConfigured:
            return "-100"
        case .noView:
            return "-200"
        case .unauthenticated:
            return "-300"
        case .noStateManager:
            return "-400"
        case .noIdToken:
            return "-500"
        case .oktaOidcError:
            return "-600"
        case .errorTokenType:
            return "-700"
        case .errorPayload:
            return "-800"
        case .noAccessToken:
            return "-900"
        }
    }
}
