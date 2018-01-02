<script>
export default {
  name: 'ImplicitCallback',
  async beforeMount () {
    await this.$auth.handleAuthentication()
    this.$router.push({
      path: this.$auth.getFromUri()
    })
  },
  render () {}
}
</script>
