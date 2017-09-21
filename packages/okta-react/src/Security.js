import React, { Component } from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import Auth from './Auth';

export default withRouter(class Security extends Component {
  constructor(props) {
    super(props);
    this.auth = new Auth(props);
  }

  getChildContext() {
    return {
      auth: this.auth
    };
  }

  static childContextTypes = {
    auth: PropTypes.object.isRequired
  }

  render() {
    return (
      <div>
        {this.props.children}
      </div> 
    );
  }
});
