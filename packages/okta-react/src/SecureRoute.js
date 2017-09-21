import React, { Component } from 'react';
import { Route } from 'react-router';
import withAuth from './withAuth';

export default withAuth(class SecureRoute extends Component {
  constructor(props) {
    super(props);

    this.state = {
      authenticated: null
    };

    this.checkAuthentication = this.checkAuthentication.bind(this);
    this.renderWrapper = this.renderWrapper.bind(this);

    this.checkAuthentication();
  }

  async checkAuthentication() {
    const authenticated = await this.props.auth.isAuthenticated();
    if (authenticated !== this.state.authenticated) {
      this.setState({ authenticated });
    }
  }

  componentDidUpdate() {
    this.checkAuthentication();
  }

  renderWrapper(renderProps) {
    if (this.state.authenticated === null) {
      return null;
    }

    if (!this.state.authenticated) {
      this.props.auth.login();
      return null;
    }
    
    const C = this.props.component;
    return <C {...renderProps} />;
  }

  render() {
    return <Route path={this.props.path} render={this.renderWrapper} />;
  }
});
