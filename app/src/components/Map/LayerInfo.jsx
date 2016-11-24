import React, { Component } from 'react';

import LayerInfoStyles from 'styles/components/map/c-layer-info.scss';

class LayerInfo extends Component {

  constructor(props) {
    super(props);

    this.defaults = {
      messages: {
        noDescription: 'No description available.'
      }
    };
  }

  render() {
    const description = this.props.info.description || this.defaults.messages.noDescription;

    return (
      <div className={LayerInfoStyles['c-layer-info']}>
        <h2 className={LayerInfoStyles['layer-title']}>{this.props.info.title}</h2>
        <p className={LayerInfoStyles['layer-description']}>{description}</p>
      </div>
    );
  }
}

LayerInfo.propTypes = {
  info: React.PropTypes.object
};

export default LayerInfo;
