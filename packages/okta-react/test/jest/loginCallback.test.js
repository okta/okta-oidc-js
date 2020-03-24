import React from 'react';
import { mount } from 'enzyme';
import LoginCallback from '../../src/LoginCallback';
import Security from '../../src/Security';
import AuthSdkError from '@okta/okta-auth-js/lib/errors/AuthSdkError';
import AuthApiError from '@okta/okta-auth-js/lib/errors/AuthApiError';
import OAuthError from '@okta/okta-auth-js/lib/errors/OAuthError';

describe('<LoginCallback />', () => {
  let authService;
  let authState;
  let mockProps;
  beforeEach(() => {
    authState = {
      isPending: true
    };
    authService = {
      on: jest.fn(),
      updateAuthState: jest.fn(),
      getAuthState: jest.fn().mockImplementation(() => authState),
      handleAuthentication: jest.fn()
    };
    mockProps = { authService };
  });

  it('renders the component', () => {
    const wrapper = mount(
      <Security {...mockProps}>
        <LoginCallback />
      </Security>
    );
    expect(wrapper.find(LoginCallback).length).toBe(1);
    expect(wrapper.text()).toBe('');
  });

  it('calls handleAuthentication', () => {
    mount(
      <Security {...mockProps}>
        <LoginCallback />
      </Security>
    );
    expect(authService.handleAuthentication).toHaveBeenCalledTimes(1);
  });

  it('renders empty by default', () => {
    const wrapper = mount(
      <Security {...mockProps}>
        <LoginCallback />
      </Security>
    );
    expect(wrapper.text()).toBe('');
  });

  describe('shows errors', () => {
    test('generic', () => {
      const errorMessage = 'I am a test error message';
      authState.error = new Error(errorMessage);
      const wrapper = mount(
        <Security {...mockProps}>
          <LoginCallback />
        </Security>
      );
      expect(wrapper.text()).toBe(`Error: ${errorMessage}`);
    });
    test('AuthSdkError', () => {
      const errorMessage = 'I am a test error message';
      authState.error = new AuthSdkError(errorMessage);
      const wrapper = mount(
        <Security {...mockProps}>
          <LoginCallback />
        </Security>
      );
      expect(wrapper.text()).toBe(`AuthSdkError: ${errorMessage}`);
    });
    test('AuthApiError', () => {
      const errorSummary = 'I am a test error message';
      authState.error = new AuthApiError({ errorSummary });
      const wrapper = mount(
        <Security {...mockProps}>
          <LoginCallback />
        </Security>
      );
      expect(wrapper.text()).toBe(`AuthApiError: ${errorSummary}`);
    });
    test('OAuthError', () => {
      const errorCode = 400;
      const errorSummary = 'I am a test error message';
      authState.error = new OAuthError(errorCode, errorSummary);
      const wrapper = mount(
        <Security {...mockProps}>
          <LoginCallback />
        </Security>
      );
      expect(wrapper.text()).toBe(`OAuthError: ${errorSummary}`);
    });
  });




});
