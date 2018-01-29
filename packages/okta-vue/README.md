# Okta Vue SDK
The Okta Vue SDK is a wrapper around the [Okta Auth SDK](https://github.com/okta/okta-auth-js), which builds on top of Okta's [OpenID Connect API](https://developer.okta.com/docs/api/resources/oidc.html).

This library currently supports:
  - [OAuth 2.0 Implicit Flow](https://tools.ietf.org/html/rfc6749#section-1.3.2)

## Getting Started
* If you do not already have a **Developer Edition Account**, you can create one at [https://developer.okta.com/signup/](https://developer.okta.com/signup/).
* If you don't have a Vue app, or are new to Vue, please start with the [Vue CLI](https://github.com/vuejs/vue-cli) guide. It will walk you through the creation of a Vue app, creating [routers](https://router.vuejs.org/en/essentials/getting-started.html), and other application development essentials.

### Add an OpenID Connect Client in Okta
In Okta, applications are OpenID Connect clients that can use Okta Authorization servers to authenticate users.  Your Okta Org already has a default authorization server, so you just need to create an OIDC client that will use it.
* Log into the Okta Developer Dashboard, click **Applications** > **Add Application**.
* Choose **Single Page App (SPA)** as the platform, then submit the form the default values, which should look like this:

| Setting             | Value                                          |
| ------------------- | ---------------------------------------------- |
| App Name            | My SPA App                                     |
| Base URIs           | http://localhost:{port}                        |
| Login redirect URIs | http://localhost:{port}/implicit/callback      |
| Grant Types Allowed | Implicit                                       |

After you have created the application there are two more values you will need to gather:

| Setting       | Where to Find                                                                  |
| ------------- | ------------------------------------------------------------------------------ |
| Client ID     | In the applications list, or on the "General" tab of a specific application.   |
| Org URL       | On the home screen of the developer dashboard, in the upper right.             |


These values will be used in your Vue application to setup the OpenID Connect flow with Okta.

## Installation

This library is available through [npm](https://www.npmjs.com/package/@okta/okta-vue). To install it, simply add it to your project:

```bash
npm install --save @okta/okta-vue
```

### Configuration
You will need the values from the OIDC client that you created in the previous step to instantiate the middleware. You will also need to know your Okta Org URL, which you can see on the home page of the Okta Developer console.

In your application's [vue-router](https://router.vuejs.org/en/essentials/getting-started.html) configuration, import the `@okta/okta-vue` plugin and pass it your OpenID Connect client information:

```typescript
// router/index.js

import Auth from '@okta/okta-vue'

Vue.use(Auth, {
  issuer: 'https://{yourOktaDomain}.com/oauth2/default',
  client_id: '{client_id}',
  redirect_uri: 'http://localhost:{port}/implicit/callback',
  scope: 'openid profile email'
})

```

### Use the Callback Handler
In order to handle the redirect back from Okta, you need to capture the token values from the URL. You'll use `/implicit/callback` as the callback URL, and use the default `Auth.handleCallback()` component included.

```typescript
// router/index.js

const router = new Router({
  ...
  mode: 'history',
  routes: [
    { path: '/implicit/callback', component: Auth.handleCallback() },
    ...
  ]
})
```

### Add a Protected Route
Routes are protected by the `authRedirectGuard`, which verifies there is a valid `accessToken` or `idToken` stored. To ensure the user has been authenticated before accessing your route, add the `requiresAuth` metadata:

```typescript
// router/index.js

{
  path: '/protected',
  component: Protected,
  meta: {
    requiresAuth: true
  }
}
```

Next, overload your router's `beforeEach()` executer to inject the global [navigation guard](https://router.vuejs.org/en/advanced/navigation-guards.html):

```typescript
// router/index.js

router.beforeEach(Vue.prototype.$auth.authRedirectGuard())
```

If a user does not have a valid session, they will be redirected to the Okta Login Page for authentication. Once authenticated, they will be redirected back to your application's **protected** page.

### Show Login and Logout Buttons
In the relevant location in your application, you will want to provide `Login` and `Logout` buttons for the user. You can show/hide the correct button by using the `$auth.isAuthenticated()` method. For example:

```typescript
// src/App.vue

<template>
  <div id="app">
    <router-link to="/" tag="button" id='home-button'> Home </router-link>
    <button v-if='authenticated' v-on:click='logout' id='logout-button'> Logout </button>
    <button v-else v-on:click='$auth.loginRedirect' id='login-button'> Login </button>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'app',
  data: function () {
    return {
      authenticated: false
    }
  },
  created () {
    this.isAuthenticated()
  },
  watch: {
    // Everytime the route changes, check for auth status
    '$route': 'isAuthenticated'
  },
  methods: {
    async isAuthenticated () {
      this.authenticated = await this.$auth.isAuthenticated()
    },
    async logout () {
      await this.$auth.logout()
      await this.isAuthenticated()

      // Navigate back to home
      this.$router.push({ path: '/' })
    }
  }
}
</script>
```

### Use the Access Token
When your users are authenticated, your Vue application has an access token that was issued by your Okta Authorization server. You can use this token to authenticate requests for resources on your server or API. As a hypothetical example, let's say you have an API that provides messages for a user. You could create a `MessageList` component that gets the access token and uses it to make an authenticated request to your server.

Here is what the Vue component could look like for this hypothentical example using [axios](https://github.com/axios/axios):

```typescript
// src/components/MessageList.vue

<template>
  <ul v-if="posts && posts.length">
    <li v-for="post in posts" :key='post.title'>
      <p><strong>{{post.title}}</strong></p>
      <p>{{post.body}}</p>
    </li>
  </ul>
</template>

<script>
import axios from 'axios'

export default {
  data () {
    return {
      posts: []
    }
  },
  async created () {
    axios.defaults.headers.common['Authorization'] = `Bearer ${await this.$auth.getAccessToken()}`
    try {
      const response = await axios.get(`http://localhost:{serverPort}/api/messages`)
      this.posts = response.data
    } catch (e) {
      console.error(`Errors! ${e}`)
    }
  }
}
</script>
```

### Using a custom login-page
The `okta-vue` SDK supports the session token redirect flow for custom login pages. For more information, [see the basic Okta Sign-in Widget functionality](https://github.com/okta/okta-signin-widget#new-oktasigninconfig).

To handle the session-token redirect flow, you can create your own navigation guard using the `requiresAuth` meta param:

```typescript
// router/index.js

router.beforeEach((from, to, next) {
  if (from.matched.some(record => record.meta.requiresAuth) && !(await Vue.prototype.$auth.isAuthenticated())) {
    // Navigate to custom login page
    next({ path: '/login' })
  } else {
    next()
  }
})
```

## Reference
### `$auth`

`$auth` is the top-most component of okta-vue. This is where most of the configuration is provided.

#### Configuration Options
  - `issuer` **(required)**: The OpenID Connect `issuer`
  - `client_id` **(required)**: The OpenID Connect `client_id`
  - `redirect_uri` **(required)**: Where the callback is hosted
  - `scope` *(optional)*: Reserved or custom claims to be returned in the tokens

#### `$auth.loginRedirect`
Performs a full page redirect to Okta based on the initial configuration.  If you have an Okta `sessionToken`, you can bypass the full-page redirect by passing in this token. This is recommended when using the [Okta Sign-In Widget](https://github.com/okta/okta-signin-widget). Simply pass in a `sessionToken` into the `loginRedirect` method follows:

```typescript
this.$auth.loginRedirect({
  sessionToken: /* sessionToken */
})
```

> Note: For information on obtaining a `sessionToken` using the [Okta Sign-In Widget](https://github.com/okta/okta-signin-widget), please see the [`renderEl()` example](https://github.com/okta/okta-signin-widget#rendereloptions-success-error).

#### `$auth.isAuthenticated`
Returns `true` if there is a valid access token or ID token.

#### `$auth.getAccessToken`
Returns the access token from storage (if it exists).

#### `$auth.getIdToken`
Returns the ID token from storage (if it exists).

#### `$auth.getUser`
Returns the result of the OpenID Connect `/userinfo` endpoint if an access token exists.

#### `$auth.handleAuthentication`
Parses the tokens returned as hash fragments in the OAuth 2.0 Redirect URI.

## Development
1. Clone the repo:
    - `git clone git@github.com:okta/okta-oidc-js.git`
2. Navigate into the `okta-vue` package:
    - `cd packages/okta-vue`
3. Install dependencies:
    - Navigate into the sample and install all `vue` dependencies
    - `cd test/e2e/harness && npm install`
4. Make your changes to `okta-vue/src/`
5. Update environment variables
    - Set the `ISSUER` and `CLIENT_ID` variables in the `test/e2e/harness/config/dev.env.js` file.
    - Manually set the `USERNAME` and `PASSWORD` environment variables via the command line. For example: `export USERNAME={username}`

## Commands

| Command        | Description                        |
| -------------- | ---------------------------------- |
| `npm start`    | Start the sample app using the SDK |
| `npm test`     | Run integration tests              |
| `npm run lint` | Run eslint linting tests           |
