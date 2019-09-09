import { createLocalVue, mount } from '@vue/test-utils'
import waitForExpect from 'wait-for-expect'
import VueRouter from 'vue-router'
import { default as OktaVue } from '../../src/okta-vue'
import AuthJS from '@okta/okta-auth-js'

jest.mock('@okta/okta-auth-js')

describe('ImplicitCallback', () => {
  const baseConfig = {
    issuer: 'https://foo',
    clientId: 'foo',
    redirectUri: 'https://foo'
  }

  let localVue
  let wrapper
  function bootstrap (options = {}) {
    AuthJS.mockImplementation(() => {
      return {
        tokenManager: {
          on: jest.fn()
        }
      }
    })

    localVue = createLocalVue()
    localVue.use(VueRouter)
    localVue.use(OktaVue, baseConfig)
    jest.spyOn(localVue.prototype.$auth, 'handleAuthentication').mockImplementation(async () => {
      return Promise.resolve(options.result)
    })
    jest.spyOn(localVue.prototype.$auth, 'getFromUri').mockImplementation(() => {
      return options.fromUri
    })

    const routes = [{ path: '/foo', component: OktaVue.handleCallback() }]
    const router = new VueRouter({
      routes
    })
    wrapper = mount(OktaVue.handleCallback(), {
      localVue,
      router
    })
    expect(wrapper.vm.$route).toBeInstanceOf(Object)
    jest.spyOn(wrapper.vm.$router, 'replace').mockImplementation()
  }

  it('renders the component', () => {
    bootstrap()
  })

  it('calls handleAuthentication', async () => {
    bootstrap()
    expect(localVue.prototype.$auth.handleAuthentication).toHaveBeenCalled()
    await waitForExpect(() => {
      expect(wrapper.vm.$router.replace).toHaveBeenCalled()
    })
  })

  it('calls router replace with the fromUri', async () => {
    const fromUri = 'https://fake'
    bootstrap({
      fromUri
    })
    await waitForExpect(() => {
      expect(wrapper.vm.$router.replace).toHaveBeenCalled()
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
