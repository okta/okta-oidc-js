import AuthJS from '@okta/okta-auth-js'
import { createLocalVue } from '@vue/test-utils'
import { default as Auth } from './Auth'

const mockAuthJsInstance = {userAgent: 'foo'}
const pkg = require('../package.json')

jest.mock('@okta/okta-auth-js')

AuthJS.mockImplementation(() => {
  return mockAuthJsInstance
})

const localVue = createLocalVue()

describe('Auth', () => {
  test('is a Vue plugin', () => {
    expect(Auth.install).toBeTruthy()
  })
  test('sets the right user agent on AuthJS', () => {
    const expectedUserAgent = `${pkg.name}/${pkg.version} foo`
    localVue.use(Auth, {
      issuer: '1',
      client_id: '2',
      redirect_uri: '3'
    })
    expect(mockAuthJsInstance.userAgent).toMatch(expectedUserAgent)
  })
  test('sets the context for the $auth plugin', () => {
    localVue.use(Auth, {
      issuer: '1',
      client_id: '2',
      redirect_uri: '3',
      response_type: 'a b'
    })
    expect(localVue.prototype.$auth).toBeDefined()
  })
})
