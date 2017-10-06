import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Security, SecureRoute, ImplicitCallback } from '@okta/okta-react';
import Home from './Home';
import Protected from './Protected';
import CustomLogin from './CustomLogin';
import SessionTokenLogin from './SessionTokenLogin';

class App extends Component {
  render() {
    return (
      <Router>
        <Security issuer={process.env.REACT_APP_ISSUER}
                  client_id={process.env.REACT_APP_CLIENT_ID}
                  redirect_uri={window.location.origin + '/implicit/callback'}
                  onAuthRequired={({history}) => history.push('/login')} >
          <Route path='/' component={Home}/>
          <Route path='/login' component={CustomLogin}/>
          <Route path='/sessionToken-login' component={SessionTokenLogin}/>
          <SecureRoute path='/protected' component={Protected}/>
          <Route path='/implicit/callback' component={ImplicitCallback} />
        </Security>
      </Router>
    );
  }
}

export default App;
