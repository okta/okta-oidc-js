import React from 'react';
import { shallow } from 'enzyme';
import ImplicitCallback from '../../src/ImplicitCallback';

describe('<ImplicitCallback />', () => {
  const mockProps = {
    auth: {}
  };

  it('should create ImplicitCallback component with default pathname', () => {
    const wrapper = shallow(
      <ImplicitCallback auth={mockProps} />
    );
    expect(wrapper.dive().props().pathname).toBe('/');
  });

  it('should create ImplicitCallback component with specified pathname', () => {
    const wrapper = shallow(
        <ImplicitCallback auth={mockProps} pathname='/custom/redirect' />
    );
    expect(wrapper.dive().props().pathname).toBe('/custom/redirect');
  });

});
