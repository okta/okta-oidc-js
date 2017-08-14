# Setup

## Create a test org
1. If you don't already have a dev org, [create one](https://developer.okta.com/signup/)
2. Applications > Add Application
3. Select Web
4. Click Done
5. Users > Add Person
6. Create and activate user

## Set environment variables

```
export ISSUER=[your okta domain]/oauth2/default
export CLIENT_ID=[your client id]
export CLIENT_SECRET=[your client secret]
export USERNAME=[created user]
export PASSWORD=[password from activation]
```
