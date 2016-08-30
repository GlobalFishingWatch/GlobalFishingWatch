import React, { Component } from 'react';
import Header from '../../containers/Header';
import StatusPage from './StatusPage';

class NotFoundPage extends Component {

  render() {
    return (
      <div>
        <Header />
        <StatusPage
          styles="-not-found"
          title="404"
          description="The content requested hasn't been found."
        />
      </div>
    );
  }
}

export default NotFoundPage;
