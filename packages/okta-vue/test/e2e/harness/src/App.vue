<template>
  <div id="app">
    <router-link to="/" tag="button"> Home </router-link>
    <button v-if='authenticated' v-on:click='logout'> Logout </button>
    <button v-else v-on:click='$auth.loginRedirect'> Login </button>
    <router-link to="/protected" tag="button"> Protected </router-link>
    <router-view/>
  </div>
</template>

<script>

export default {
  name: 'app',
  data: function () {
    return { authenticated: false }
  },
  created () { this.isAuthenticated() },
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
      // Stay on current page and make sure it is refreshed
      this.$router.push({ path: '/' })
    }
  }
}
</script>
