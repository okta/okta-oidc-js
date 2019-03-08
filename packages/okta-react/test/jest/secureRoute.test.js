import React from 'react';
import { mount } from 'enzyme';
import { MemoryRouter, Route } from 'react-router-dom';
import SecureRoute from '../../src/SecureRoute';
import Security from '../../src/Security';

describe('<SecureRoute />', () => {
  const mockProps = {
    auth: {},
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
  it('should not immediately render when not provided an "authenticated" prop', () => {
    const wrapper = mount(
      <MemoryRouter>
        <Security {...mockProps}>
          <SecureRoute
            path='/'
            render={() => <div className="doNotRenderThis" />}
          />
        </Security>
      </MemoryRouter>
    );
    expect(wrapper.find('.doNotRenderThis').length).toBe(0);
  });
  it('should accept a "authenticated" override initial prop and initialize state to its value', () => {
    const wrapper = mount(
      <MemoryRouter>
        <Security {...mockProps}>
          <SecureRoute
            path='/'
            authenticated
            render={() => <div className="renderThis" />}
          />
        </Security>
      </MemoryRouter>
    );
    expect(wrapper.find('.renderThis').length).toBe(1);
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
