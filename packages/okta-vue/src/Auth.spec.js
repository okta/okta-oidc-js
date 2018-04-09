import AuthJS from '@okta/okta-auth-js'
import { createLocalVue } from '@vue/test-utils'
import { default as Auth } from './Auth'

const pkg = require('../package.json')
jest.mock('@okta/okta-auth-js')

const mockAuthJsInstance = {
  userAgent: 'foo',
  token: {
    getWithRedirect: jest.fn()
  }
}

AuthJS.mockImplementation(() => {
  return mockAuthJsInstance
})

describe('Auth', () => {
  test('is a Vue plugin', () => {
    expect(Auth.install).toBeTruthy()
  })
  test('sets the right user agent on AuthJS', () => {
    const expectedUserAgent = `${pkg.name}/${pkg.version} foo`
    const localVue = createLocalVue()
    localVue.use(Auth, {
      issuer: '1',
      client_id: '2',
      redirect_uri: '3'
    })
    expect(mockAuthJsInstance.userAgent).toMatch(expectedUserAgent)
  })
  test('sets the right scope and response_type when redirecting to Okta', () => {
    const localVue = createLocalVue()
    localVue.use(Auth, {
      issuer: '1',
      client_id: '2',
      redirect_uri: '3'
    })
    localVue.prototype.$auth.loginRedirect()
    const mockCallValues = mockAuthJsInstance.token.getWithRedirect.mock.calls[0][0]
    expect(mockCallValues.responseType).toEqual(expect.arrayContaining(['id_token', 'token']))
    expect(mockCallValues.scopes).toEqual(expect.arrayContaining(['openid']))
  })
  test('sets the right scope and response_type overrides when redirecting to Okta', () => {
    const localVue = createLocalVue()
    localVue.use(Auth, {
      issuer: '1',
      client_id: '2',
      redirect_uri: '3',
      scope: 'foo bar',
      response_type: 'token'
    })
    localVue.prototype.$auth.loginRedirect()
    const mockCallValues = mockAuthJsInstance.token.getWithRedirect.mock.calls[1][0]
    expect(mockCallValues.responseType).toEqual(expect.arrayContaining(['token']))
    expect(mockCallValues.scopes).toEqual(expect.arrayContaining(['foo', 'bar']))
  })
})
