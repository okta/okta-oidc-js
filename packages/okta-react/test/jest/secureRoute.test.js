import React from 'react';
import { mount } from 'enzyme';
import { MemoryRouter, Route } from 'react-router-dom';
import SecureRoute from '../../src/SecureRoute';
import Security from '../../src/Security';

describe('<SecureRoute />', () => {
  const mockProps = {
    auth: {
      isAuthenticated: jest.fn()
    },
  };

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
