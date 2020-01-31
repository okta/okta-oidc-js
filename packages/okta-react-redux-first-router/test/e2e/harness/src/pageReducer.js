import { NOT_FOUND } from 'redux-first-router';

const components = {
  HOME: 'Home',
  LOGIN: 'CustomLogin',
  SESSION_TOKEN_LOGIN: 'SessionTokenLogin',
  IMPLICIT_CALLBACK: 'ImplicitCallback',
  PKCE_CALLBACK: 'ImplicitCallback',
  PROTECTED: 'Protected',
  [NOT_FOUND]: 'NotFound'
};

export default (state = 'HOME', action = {}) => components[action.type] || state;