<template>
  <div class="protected">
    {{ message }}
    <pre>{{ user }}</pre>
  </div>
</template>

<script>
export default {
  name: 'Protected',
  data () {
    return {
      message: 'Protected!',
      user: ''
    }
  },
  created () {
    this.getUser()
  },
  methods: {
    async getUser () {
      const user = await this.$auth.getUser()
      this.user = JSON.stringify(user, null, 4)
    }
  }
}
</script>
