import React, { Component } from 'react';
import classnames from 'classnames';
import iso3311a2 from 'iso-3166-1-alpha-2';
import CloseIcon from 'babel!svg-react!../../../assets/icons/close.svg?name=Icon';
import vesselPanelStyles from 'styles/components/c-vessel-info-panel.scss';
import helperStyles from 'styles/_helpers.scss';

class VesselInfoPanel extends Component {

  render() {
    let vesselInfoContents = null;
    let iso = null;
    const visibilityClass = this.props.vesselVisibility ? null : helperStyles['_is-hidden'];

    if (this.props.vesselInfo !== undefined && this.props.vesselInfo.flag) {
      iso = iso3311a2.getCountry(this.props.vesselInfo.flag);
    }

    if (this.props.vesselInfo !== undefined && this.props.vesselInfo.isCluster) {
      vesselInfoContents = (
        <div className={vesselPanelStyles['vessel-metadata']}>
          There are multiple vessels at this location.
          <a onClick={() => this.props.zoomIntoVesselCenter()} className={vesselPanelStyles.zoom}>
            Zoom in to see individual points.
          </a>

        </div>
      );
    } else {
      vesselInfoContents = (
        <div className={vesselPanelStyles['vessel-metadata']}>
          <div className={vesselPanelStyles['row-info']}>
            <span className={vesselPanelStyles.key}>Name</span>
            <span className={vesselPanelStyles.value}>{this.props.vesselInfo.vesselname || '---'}</span>
          </div>
          <div className={vesselPanelStyles['row-info']}>
            <span className={vesselPanelStyles.key}>IMO</span>
            <span className={vesselPanelStyles.value}>{this.props.vesselInfo.imo || '---'}</span>
          </div>
          <div className={vesselPanelStyles['row-info']}>
            <span className={vesselPanelStyles.key}>Class</span>
            <span className={vesselPanelStyles.value}>{this.props.vesselInfo.shiptype_text || '---'}</span>
          </div>
          <div className={vesselPanelStyles['row-info']}>
            <span className={vesselPanelStyles.key}>MMSI</span>
            <span className={vesselPanelStyles.value}>{this.props.vesselInfo.mmsi || '---'}</span>
          </div>
          <div className={vesselPanelStyles['row-info']}>
            <span className={vesselPanelStyles.key}>Country</span>
            <span className={vesselPanelStyles.value}>{iso || '---'}</span>
          </div>
          <div className={vesselPanelStyles['row-info']}>
            <span className={vesselPanelStyles.key}>Callsign</span>
            <span className={vesselPanelStyles.value}>{this.props.vesselInfo.callsign || '---'}</span>
          </div>
          {this.props.vesselInfo.link && <a
            className={vesselPanelStyles['external-link']}
            target="_blank"
            href={this.props.vesselInfo.link}
          >Check it on MarineTraffic.com
          </a>
          }
        </div>
      );
    }

    return (
      <div
        className={classnames(vesselPanelStyles['c-vessel-info-panel'], visibilityClass)}
        id="vesselBox"
      >
        <div>
          <span
            onClick={() => this.props.toggleVisibility(false)}
            className={vesselPanelStyles['button-close']}
          >
            <CloseIcon className={vesselPanelStyles.cross} />
          </span>
          {vesselInfoContents}
        </div>
      </div>);
  }
}

VesselInfoPanel.propTypes = {
  vesselInfo: React.PropTypes.object,
  toggleVisibility: React.PropTypes.func,
  zoomIntoVesselCenter: React.PropTypes.func,
  vesselVisibility: React.PropTypes.bool
};

export default VesselInfoPanel;
