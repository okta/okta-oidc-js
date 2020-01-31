import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import { connectRoutes } from 'redux-first-router';
import secureRouteThunk from '@okta/okta-react/redux-first-router';

import page from './pageReducer';
import protectedThunk from './thunks/protected';

const routesMap = {
  HOME: '/',
  LOGIN: '/login',
  SESSION_TOKEN_LOGIN: '/sessionToken-login',
  IMPLICIT_CALLBACK: '/implicit/callback',
  PKCE_CALLBACK: '/pkce/callback',
  PROTECTED: { path: '/protected', thunk: secureRouteThunk(protectedThunk) }
};

export default function configureStore(preloadedState) {
  const { reducer, middleware, enhancer } = connectRoutes(routesMap);

  const rootReducer = combineReducers({ page, location: reducer });
  const middlewares = applyMiddleware(middleware);
  const enhancers = compose(enhancer, middlewares);

  const store = createStore(rootReducer, preloadedState, enhancers);

  return { store };
}