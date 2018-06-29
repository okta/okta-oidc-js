<script>
export default {
  name: 'ImplicitCallback',
  async beforeMount () {
    try {
      await this.$auth.handleAuthentication()
      this.$router.replace({
        path: this.$auth.getFromUri()
      })
    } catch (error) {
      console.warn(error);
      this.$router.replace('/');
    }
  },
  render () {}
}
</script>
