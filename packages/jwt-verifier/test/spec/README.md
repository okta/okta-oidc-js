
## Prerequisite
Export the following environment variables according to your environment

```
export ISSUER=https://example.oktapreview.com/oauth2/default
export CLIENT_ID={yourAppClientId}
export USERNAME={yourOrgUserName}
export PASSWORD={yourOrgPassword}
export REDIRECT_URI=http://localhost:8080/implicit/callback
```

## Run e2e Tests
Run the following command to run all the e2e tests.
Ensure you're in the `jwt-verifier` base directory

```
npm run test:e2e
```
