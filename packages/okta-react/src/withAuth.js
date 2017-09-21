import React from 'react';
import Secure from './Secure';

const withAuth = Component => {
  const C = props => (
    <Secure render={secureComponentProps => (
      <Component {...props} {...secureComponentProps}/>
    )}/>
  );

  C.displayName = `withAuth(${Component.displayName || Component.name})`;

  return C;
};

export default withAuth;
