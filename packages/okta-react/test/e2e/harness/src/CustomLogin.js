import { Component } from 'react';
import { withAuth } from '@okta/okta-react';

export default withAuth(class CustomLogin extends Component {
  render() {
    this.props.auth.redirect();
    return null;
  }
});
