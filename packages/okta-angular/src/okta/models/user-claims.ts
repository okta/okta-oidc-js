/**
 * @export
 * @interface UserClaims
 *
 * This interface represents the union of possible known claims that are in an
 * ID Token or returned from the /userinfo response and depend on the
 * response_type and scope parameters in the authorize request
 */
export interface UserClaims {
  auth_time?: Number;
  aud?: string;
  email?: string;
  email_verified?: Boolean;
  exp?: Number;
  family_name?: string;
  given_name?: string;
  iat?: Number;
  iss?: string;
  jti?: string;
  locale?: string;
  name?: string;
  nonce?: string;
  preferred_username?: string;
  sub: string;
  updated_at?: Number;
  ver?: Number;
  zoneinfo?: string;
  [propName: string]: any;  // For custom claims that may be configured by the org admin
}
