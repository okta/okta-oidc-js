import ImplicitCallback from './components/ImplicitCallback'
import Auth from './Auth'

function install (Vue, options) {
  const auth = new Auth(options)
  Vue.prototype.$auth = auth
}

function handleCallback () { return ImplicitCallback }

export default { install, handleCallback }
