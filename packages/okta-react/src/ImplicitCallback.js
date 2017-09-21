import React, { Component } from 'react';
import { Redirect } from 'react-router';
import withAuth from './withAuth';

export default withAuth(class ImplicitCallback extends Component {
  constructor(props) {
    super(props);

    this.state = {
      authenticated: null,
      error: null
    };

    props.auth.handleAuthentication()
    .then(() => {
      this.setState({ authenticated: true });
    })
    .catch(err => this.setState({ authenticated: false, error: err.toString() }));
  }

  render() {
    if (this.state.authenticated === null) {
      return null;
    }

    const referrerKey = 'secureRouterReferrerPath';
    const pathname = localStorage.getItem(referrerKey) || '/';
    localStorage.removeItem(referrerKey);

    return this.state.authenticated ? 
      <Redirect to={{ pathname }}/> :
      <p>{this.state.error}</p>;
  }
});
