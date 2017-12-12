<template>
  <div class="sessionTokenLogin">
    <br/>
    <label>
      Username:
      <input id="username" type="text" v-model="username"/>
      Password:
      <input id="password" type="password" v-model="password"/>
    </label>
    <button id="submit" v-on:click="signIn">Login</button>
  </div>
</template>

<script>
import OktaAuth from '@okta/okta-auth-js'

export default {
  name: 'SessionTokenLogin',
  data () {
    return { username: '', password: '' }
  },
  methods: {
    signIn () {
      const authJS = new OktaAuth({ url: process.env.ISSUER.split('/oauth2/')[0] })

      authJS.signIn({
        username: this.username,
        password: this.password
      })
      .then(res =>
        this.$auth.loginRedirect({
          sessionToken: res.sessionToken
        })
      )
      .catch(err => console.error(`Found an error: ${err}`))
    }
  }
}
</script>
