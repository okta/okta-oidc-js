import AuthJS from '@okta/okta-auth-js'
import { createLocalVue } from '@vue/test-utils'
import { default as Auth } from './Auth'

const mockAuthJsInstance = {userAgent: 'foo'}
const pkg = require('../package.json')

jest.mock('@okta/okta-auth-js')

AuthJS.mockImplementation(() => {
  return mockAuthJsInstance
})

describe('Auth', () => {
  test('is a Vue plugin', () => {
    expect(Auth.install).toBeTruthy()
  })
  test('sets the right user agent on AuthJS', () => {
    const expectedUserAgent = `${pkg.name}/${pkg.version} foo`
    createLocalVue().use(Auth, {
      issuer: '1',
      client_id: '2',
      redirect_uri: '3'
    })
    expect(mockAuthJsInstance.userAgent).toMatch(expectedUserAgent)
  })
})
