import React from 'react';
import { mount } from 'enzyme';
import OktaError from '../../src/OktaError';
import { AuthSdkError, AuthApiError, OAuthError } from '@okta/okta-auth-js';

describe('<OktaError />', () => {
    it('renders a generic error', () => {
      const errorMessage = 'I am a test error message';
      const error = new Error(errorMessage);
      const wrapper = mount(
        <OktaError error={error}/>
      );
      expect(wrapper.text()).toBe(`Error: ${errorMessage}`);
    });
    it('renders an AuthSdkError', () => {
      const errorMessage = 'I am a test error message';
      const error = new AuthSdkError(errorMessage);
      const wrapper = mount(
        <OktaError error={error}/>
      );
      expect(wrapper.text()).toBe(`AuthSdkError: ${errorMessage}`);
    });
    it('renders an AuthApiError', () => {
      const errorSummary = 'I am a test error message';
      const error = new AuthApiError({ errorSummary });
      const wrapper = mount(
        <OktaError error={error}/>
      );
      expect(wrapper.text()).toBe(`AuthApiError: ${errorSummary}`);
    });
    it('renders an OAuthError', () => {
      const errorCode = 400;
      const errorSummary = 'I am a test error message';
      const error = new OAuthError(errorCode, errorSummary);
      const wrapper = mount(
        <OktaError error={error}/>
      );
      expect(wrapper.text()).toBe(`OAuthError: ${errorSummary}`);
    });
});

