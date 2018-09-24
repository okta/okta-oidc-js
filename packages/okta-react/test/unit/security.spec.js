import React from 'react';
import { mount } from 'enzyme';
import { MemoryRouter } from "react-router-dom";
import Security from "../../src/Security";

describe('<Security />', () => {
  const mockProps = {
    auth: {}
  };

  it('should accept a className prop and render a component using the className', () => {
    const wrapper = mount(
      <MemoryRouter>
        <Security auth={mockProps} className='foo bar' />
      </MemoryRouter>
    );
    expect(wrapper.find(Security).hasClass('foo bar')).toEqual(true);
    expect(wrapper.find(Security).props().className).toBe('foo bar');
  });
});
