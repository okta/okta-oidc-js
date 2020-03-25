import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from "react-router-dom";
import Security from "../../src/Security";
import { useOktaAuth } from '../../src/OktaContext';

describe('<Security />', () => {
  const VALID_CONFIG = {
    issuer: 'https://example.com/oauth2/default',
    clientId: 'foo',
    redirectUri: 'https://example.com'
  };
  let authService;
  let initialAuthState;
  beforeEach(() => {
    initialAuthState = {
      isInitialState: true
    };
    authService = {
      on: jest.fn(),
      updateAuthState: jest.fn(),
      getAuthState: jest.fn().mockImplementation(() => initialAuthState)
    };
  });

  it('gets initial state from authService and exposes it on the context', () => {
    const mockProps = {
      authService
    };
    const MyComponent = jest.fn().mockImplementation(() => {
      const oktaProps = useOktaAuth();
      expect(oktaProps.authState).toBe(initialAuthState);
      return null; 
    });
    mount(
      <MemoryRouter>
        <Security {...mockProps}>
          <MyComponent />
        </Security>
      </MemoryRouter>
    );
    expect(authService.getAuthState).toHaveBeenCalled();
    expect(MyComponent).toHaveBeenCalled();
  });

  it('calls updateAuthState and updates the context', () => {
    const newAuthState = {
      fromUpdateAuthState: true
    };
    let callback;
    authService.on.mockImplementation((eventName, fn) => {
      expect(eventName).toBe('authStateChange');
      callback = fn;
    });
    authService.updateAuthState.mockImplementation(() => {
      authService.getAuthState.mockImplementation(() => newAuthState);
      callback();
    });
    const mockProps = {
      authService
    };
    let call = 1;

    const MyComponent = jest.fn().mockImplementation(() => {
      const oktaProps = useOktaAuth();
      if (call === 1) {
        expect(oktaProps.authState).toBe(initialAuthState);
      } else if (call === 2) {
        expect(oktaProps.authState).toBe(newAuthState);
      }
      call++;
      return null; 
    });

    mount(
      <MemoryRouter>
        <Security {...mockProps}>
          <MyComponent />
        </Security>
      </MemoryRouter>
    );

    expect(authService.on).toHaveBeenCalledTimes(1);
    expect(authService.updateAuthState).toHaveBeenCalledTimes(1);
    expect(MyComponent).toHaveBeenCalledTimes(2);
  });

  it('subscribes to "authStateChange" and updates the context', () => {
    const mockAuthStates = [
      initialAuthState,
      {
        fromUpdateAuthState: true
      },
      {
        fromEventDispatch: true
      }
    ];
    let callback;
    let stateCount = 0;
    authService.getAuthState.mockImplementation( () => { 
      return mockAuthStates[stateCount];
    });
    authService.on.mockImplementation((eventName, fn) => {
      expect(eventName).toBe('authStateChange');
      callback = fn;
    });
    authService.updateAuthState.mockImplementation(() => {
      stateCount++;
      callback();
    });
    const mockProps = {
      authService
    };
    let call = 1;
    const MyComponent = jest.fn().mockImplementation(() => {
      const oktaProps = useOktaAuth();
      if (call === 1) {
        expect(oktaProps.authState).toBe(initialAuthState);
      } else if (call === 2) {
        expect(oktaProps.authState).toBe(mockAuthStates[1]);
      } else if (call === 3) {
        expect(oktaProps.authState).toBe(mockAuthStates[2]);
      }
      call++;
      return null; 
    });
    mount(
      <MemoryRouter>
        <Security {...mockProps}>
          <MyComponent />
        </Security>
      </MemoryRouter>
    );
    expect(authService.on).toHaveBeenCalledTimes(1);
    expect(authService.updateAuthState).toHaveBeenCalledTimes(1);
    expect(MyComponent).toHaveBeenCalledTimes(2);
    MyComponent.mockClear();
    act(() => {
      stateCount++;
      callback();
    });
    expect(MyComponent).toHaveBeenCalledTimes(1);
  });

  it('should accept a className prop and render a component using the className', () => {
    const mockProps = {
      authService
    };
    const wrapper = mount(
      <MemoryRouter>
        <Security {...mockProps} className='foo bar' />
      </MemoryRouter>
    );
    expect(wrapper.find(Security).hasClass('foo bar')).toEqual(true);
    expect(wrapper.find(Security).props().className).toBe('foo bar');
  });

  it('Accepts token manager config', () => {
    const tokenManager = {
      secure: true,
      storage: 'cookie'
    }

    const mockProps = Object.assign({}, VALID_CONFIG, {
      tokenManager,
      authService
    });
    const wrapper = mount(
      <MemoryRouter>
        <Security {...mockProps} />
      </MemoryRouter>
    );
    expect(wrapper.find(Security).props().tokenManager).toBe(tokenManager);
  })
});
