import React from 'react';
import { mount } from 'enzyme';
import LoginCallback from '../../src/LoginCallback';
import Security from '../../src/Security';

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

  it('calls handleAuthentication when authState is resolved', () => {
    authState.isPending = false;
    authState.isAuthorized = true;

    mount(
      <Security {...mockProps}>
        <LoginCallback />
      </Security>
    );
    expect(authService.handleAuthentication).toHaveBeenCalledTimes(1);
  });

  it('does not call handleAuthentication when authState.isPending', () => {
    mount(
      <Security {...mockProps}>
        <LoginCallback />
      </Security>
    );
    expect(authService.handleAuthentication).toHaveBeenCalledTimes(0);
  });

  describe('shows errors', () => {
    it('does not render errors without an error', () => { 
      const wrapper = mount(
        <Security {...mockProps}>
          <LoginCallback />
        </Security>
      );
      expect(wrapper.text()).toBe('');
    });

    it('does not render errors while authState.isPending', () => { 
      authState.error = new Error('oh drat!');
      const wrapper = mount(
        <Security {...mockProps}>
          <LoginCallback />
        </Security>
      );
      expect(wrapper.text()).toBe('');
    });

    it('renders errors while authState is not pending and there is an error', () => { 
      authState.isPending = false;
      authState.isAuthenticated = true;
      authState.error = new Error('oh drat!');

      const wrapper = mount(
        <Security {...mockProps}>
          <LoginCallback />
        </Security>
      );
      expect(wrapper.text()).toBe('Error: oh drat!');
    });

    it('can be passed a custom component to render', () => { 
      authState.isPending = false;
      authState.isAuthenticated = true;
      authState.error = { has: 'errorData' };

      const MyErrorComponent = ({ error }) => { 
        return (<p>Override: {error.has}</p>);
      };

      const wrapper = mount(
        <Security {...mockProps}>
          <LoginCallback errorComponent={MyErrorComponent}/>
        </Security>
      );
      expect(wrapper.text()).toBe('Override: errorData');
    });

  });

});
