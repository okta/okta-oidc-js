import { Component } from 'react';
import PropTypes from 'prop-types';

export default class Secure extends Component {
  static contextTypes = {
    auth: PropTypes.object.isRequired
  }

  render() {
    return this.props.render({
      auth: this.context.auth
    });
  }
}
