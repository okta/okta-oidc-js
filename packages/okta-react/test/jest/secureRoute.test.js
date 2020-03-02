import React from 'react';
import { mount } from 'enzyme';
import { MemoryRouter, Route } from 'react-router-dom';
import SecureRoute from '../../src/SecureRoute';
import Security from '../../src/Security';

describe('<SecureRoute />', () => {
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
      login: jest.fn()
    };
    mockProps = { authService };
  });
  describe('isAuthenticated: true', () => {
    beforeEach(() => {
      authState.isAuthenticated = true;
    });
    it('will render wrapped component', () => {
      const MyComponent = function() { return <div>hello world</div>; };
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <SecureRoute
              component={MyComponent}
            />
          </Security>
        </MemoryRouter>
      );
      expect(wrapper.find(MyComponent).html()).toBe('<div>hello world</div>');
    });
  });
  describe('isAuthenticated: false', () => {
    beforeEach(() => {
      authState.isAuthenticated = false;
    });
    it('will not render wrapped component', () => {
      const MyComponent = function() { return <div>hello world</div>; };
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <SecureRoute
              component={MyComponent}
            />
          </Security>
        </MemoryRouter>
      );
      expect(wrapper.find(MyComponent).length).toBe(0);
    });
    describe('isPending: false', () => {
      beforeEach(() => {
        authState.isPending = false;
      });
      it('calls login()', () => {
        mount(
          <MemoryRouter>
            <Security {...mockProps}>
              <SecureRoute />
            </Security>
          </MemoryRouter>
        );
        expect(authService.login).toHaveBeenCalled();
      });
    });
    describe('isPending: true', () => {
      beforeEach(() => {
        authState.isPending = true;
      });
      it('does not call login()', () => {
        mount(
          <MemoryRouter>
            <Security {...mockProps}>
              <SecureRoute />
            </Security>
          </MemoryRouter>
        );
        expect(authService.login).not.toHaveBeenCalled();
      });
    });
  });
  it('should accept a "path" prop and render a component', () => {
    const wrapper = mount(
      <MemoryRouter>
        <Security {...mockProps}>
          <SecureRoute
            path='/'
          />
        </Security>
      </MemoryRouter>
    );
    expect(wrapper.find(SecureRoute).props().path).toBe('/');
  });

  it('should accept an "exact" prop and render a component', () => {
    const wrapper = mount(
      <MemoryRouter>
        <Security {...mockProps}>
          <SecureRoute
            exact={true}
            path='/'
          />
        </Security>
      </MemoryRouter>
    );
    expect(wrapper.find(SecureRoute).props().exact).toBe(true);
  });

  it('should not contain an "exact" prop and render a component', () => {
    const wrapper = mount(
      <MemoryRouter>
        <Security {...mockProps}>
          <SecureRoute
            path='/'
          />
        </Security>
      </MemoryRouter>
    );
    expect(wrapper.find(SecureRoute).props().exact).toBeUndefined();
  });

  it('should accept a "strict" prop and render a component', () => {
    const wrapper = mount(
      <MemoryRouter>
        <Security {...mockProps}>
          <SecureRoute
            strict={true}
            path='/'
          />
        </Security>
      </MemoryRouter>
    );
    expect(wrapper.find(SecureRoute).props().strict).toBe(true);
  });

  it('should accept a "sensitive" prop and render a component', () => {
    const wrapper = mount(
      <MemoryRouter>
        <Security {...mockProps}>
          <SecureRoute
            sensitive={true}
            path='/'
          />
        </Security>
      </MemoryRouter>
    );
    expect(wrapper.find(SecureRoute).props().sensitive).toBe(true);
  });

  it('should accept an "exact" prop and pass it to an internal Route', () => {
    const wrapper = mount(
      <MemoryRouter>
        <Security {...mockProps}>
          <SecureRoute
            exact={true}
            path='/'
          />
        </Security>
      </MemoryRouter>
    );
    const secureRoute = wrapper.find(SecureRoute);
    expect(secureRoute.find(Route).props().exact).toBe(true);
  });

  it('should accept a "strict" prop and pass it to an internal Route', () => {
    const wrapper = mount(
      <MemoryRouter>
        <Security {...mockProps}>
          <SecureRoute
            strict={true}
            path='/'
          />
        </Security>
      </MemoryRouter>
    );
    const secureRoute = wrapper.find(SecureRoute);
    expect(secureRoute.find(Route).props().strict).toBe(true);
  });

  it('should accept a "sensitive" prop and pass it to an internal Route', () => {
    const wrapper = mount(
      <MemoryRouter>
        <Security {...mockProps}>
          <SecureRoute
            sensitive={true}
            path='/'
          />
        </Security>
      </MemoryRouter>
    );
    const secureRoute = wrapper.find(SecureRoute);
    expect(secureRoute.find(Route).props().sensitive).toBe(true);
  });
});
