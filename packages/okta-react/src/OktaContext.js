import React, { useContext } from 'react';

const OktaContext = React.createContext();

export const useOkta = () => {
  const { auth } = useContext(OktaContext);

  return {
    auth,
  };
};

export default OktaContext;
