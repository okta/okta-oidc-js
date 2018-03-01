
## Prerequisite
Export the following environment variables according to your environment

```
export ISSUER=[your okta domain]/oauth2/default
export CLIENT_ID=[your client id]
export USERNAME=[created user]
export PASSWORD=[password from activation]
export REDIRECT_URI=[redirect uri to your SPA]
```

## Run e2e Tests
Run the following command to run all the e2e tests.
Ensure you're in the `jwt-verifier` base directory

```
npm run test:e2e
```
