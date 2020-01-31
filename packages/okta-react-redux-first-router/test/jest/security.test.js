import React from 'react';
import { mount } from 'enzyme';
import { MemoryRouter } from "react-router-dom";
import Security from "../../src/Security";

describe('<Security />', () => {

  const VALID_CONFIG = {
    issuer: 'https://foo/oauth2/default',
    client_id: 'foo',
    redirect_uri: 'https://foo'
  };

  it('should accept a className prop and render a component using the className', () => {
    const mockProps = {
      auth: {}
    };
    const wrapper = mount(
      <MemoryRouter>
        <Security auth={mockProps} className='foo bar' />
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
      tokenManager
    });
    const wrapper = mount(
      <MemoryRouter>
        <Security {...mockProps} />
      </MemoryRouter>
    );
    expect(wrapper.find(Security).props().tokenManager).toBe(tokenManager);
  })
});
