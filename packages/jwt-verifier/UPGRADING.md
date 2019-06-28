# Upgrading between versions of @okta/jwt-verifier

## Upgrading to the 1.x series

### `expectedAud` is new and required 

The 0.x series `verifyAccessToken(tokenString)` is replaced by `verifyAccessToken(tokenString, expectedAud)`.

The `expectedAud` parameter is required, and must match the `aud` claim within the ticket.  

"api://default" is a common value for this claim if not set otherwise.

Additional validations are made (such as the `iss` claim must match the `issuer` given to the verifier), but they should always have been true and don't require additional configuration

### The `clientId` is no longer required

Access Tokens are not required to be bound to a clientId, so the requirement of passing a clientId to the `OktaJwtVerifier()` constructor has been removed.  You can pass the clientId and assert that any `cid` claim matches by using the "Custom Claims Assertions" as outlined in the README.
