import { createLocalVue } from '@vue/test-utils'
import { default as OktaVue } from '../../src/okta-vue'
import Auth from '../../src/Auth'
import ImplicitCallback from '../../src/components/ImplicitCallback'

jest.mock('@okta/okta-auth-js')

const baseConfig = {
  issuer: 'https://foo',
  clientId: 'foo',
  redirectUri: 'foo'
}

describe('OktaVue module', () => {
  test('is a Vue plugin', () => {
    expect(OktaVue.install).toBeTruthy()
  })
  test('Sets an instance of Auth on Vue prototype', () => {
    const localVue = createLocalVue()
    localVue.use(OktaVue, baseConfig)
    expect(localVue.prototype.$auth instanceof Auth).toBeTruthy()
  })
  test('handleCallback() returns ImplicitCallback component', () => {
    expect(typeof OktaVue.handleCallback).toBe('function')
    expect(OktaVue.handleCallback()).toBe(ImplicitCallback)
  })
})
