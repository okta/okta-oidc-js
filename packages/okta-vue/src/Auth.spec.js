import AuthJS from '@okta/okta-auth-js'
import { createLocalVue } from '@vue/test-utils'
import { default as Auth } from './Auth'

jest.mock('@okta/okta-auth-js')

const mockAuthJsInstance = {userAgent: 'foo'}

AuthJS.mockImplementation(() => {
  return mockAuthJsInstance
})

const pkg = require('../package.json')

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
