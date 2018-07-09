<script>
export default {
  name: 'ImplicitCallback',
  data: () => ({
    error_message: '',
    error: false,
  }),
  async beforeMount() {
    try {
      await this.$auth.handleAuthentication();
      this.$router.replace({
        path: this.$auth.getFromUri(),
      });
    } catch (e) {
      const handler = this.$auth.onAuthenticationError;
      if (handler) {
        return handler.call(this, e);
      }
      // Display error message on this callback view
      this.error_message = e.message;
      this.error = true;
    }
  },
  render(createElement) {
    if (this.error) {
      return createElement('div', this.error_message);
    }
    return createElement;
  },
};
</script>
