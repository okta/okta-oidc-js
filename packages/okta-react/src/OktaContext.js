import React, { useContext } from 'react';

const OktaContext = React.createContext();

export const useAuth = () => {
  const { auth } = useContext(OktaContext);

  return {
    auth,
  };
};

export default OktaContext;
