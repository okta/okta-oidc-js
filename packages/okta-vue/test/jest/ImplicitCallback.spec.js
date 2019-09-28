import { createLocalVue, mount } from '@vue/test-utils'
import VueRouter from 'vue-router'
import { default as Auth } from '../../src/Auth'

describe('ImplicitCallback', () => {
  const baseConfig = {
    issuer: 'https://foo',
    clientId: 'foo',
    redirectUri: 'foo'
  }

  let localVue
  let wrapper
  function bootstrap (options = {}) {
    localVue = createLocalVue()
    localVue.use(VueRouter)
    localVue.use(Auth, baseConfig)
    jest.spyOn(localVue.prototype.$auth, 'handleAuthentication').mockReturnValue(options.result)
    jest.spyOn(localVue.prototype.$auth, 'getFromUri').mockReturnValue(options.fromUri)

    const routes = [{ path: '/foo', component: Auth.handleCallback() }]
    const router = new VueRouter({
      routes
    })
    wrapper = mount(Auth.handleCallback(), {
      localVue,
      router
    })
    expect(wrapper.vm.$route).toBeInstanceOf(Object)
    jest.spyOn(wrapper.vm.$router, 'replace').mockImplementation()
  }

  it('renders the component', () => {
    bootstrap()
  })

  it('calls handleAuthentication', () => {
    bootstrap()
    expect(localVue.prototype.$auth.handleAuthentication).toHaveBeenCalled()
  })

  it('calls router replace with the fromUri', () => {
    const fromUri = 'fake'
    bootstrap({
      fromUri
    })
    expect(localVue.prototype.$auth.getFromUri).toHaveBeenCalled()
    expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({ path: fromUri })
  })

  // TODO: handle errors on callback?
  xit('handles promise rejection', () => {
    bootstrap({
      result: Promise.reject(new Error('test'))
    })
  })
})
