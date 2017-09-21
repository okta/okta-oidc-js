import React from 'react';
import { Route } from 'react-router';
import withAuth from './withAuth';

export default withAuth(props => {
  // Set the login route on the auth context
  props.auth.setLoginPath(props.path);
  return <Route {...props} />;
});
