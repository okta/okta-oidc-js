<template></template>

<script>
export default {
  name: 'ImplicitCallback',
  async beforeMount () {
    this.$router.push({ path: await this.$auth.handleAuthentication() })
  }
}
</script>
