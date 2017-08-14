import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import { LAYER_TYPES, REVERSE_TOOLTIP_ITEMS_MOBILE } from 'constants';
import LayerBlendingOptionsTooltip from 'components/Map/LayerBlendingOptionsTooltip';
import LayerListStyles from 'styles/components/map/layer-list.scss';
import icons from 'styles/icons.scss';
import ReportIcon from '-!babel-loader!svg-react-loader!assets/icons/report-icon.svg?name=ReportIcon';
import InfoIcon from '-!babel-loader!svg-react-loader!assets/icons/info-icon.svg?name=InfoIcon';
import DeleteIcon from '-!babel-loader!svg-react-loader!assets/icons/delete-icon.svg?name=DeleteIcon';
import Toggle from 'components/Shared/Toggle';

class LayerItem extends Component {

  onChangeVisibility() {
    if (this.props.layer.visible && this.props.showBlending) {
      this.props.onLayerBlendingToggled(this.props.layerIndex);
    }

    this.props.toggleLayerVisibility(this.props.layer.id);
  }

  onChangeOpacity(transparency) {
    if (!this.props.layer.visible) {
      this.props.toggleLayerVisibility(this.props.layer.id);
    }

    this.props.setLayerOpacity(transparency, this.props.layer.id);
  }

  onChangeHue(hue) {
    if (!this.props.layer.visible) {
      this.props.toggleLayerVisibility(this.props.layer.id);
    }

    this.props.setLayerHue(hue, this.props.layer.id);
  }

  onChangeLayerLabel(value) {
    this.props.setLayerLabel(this.props.layer.id, value);
  }

  onClickReport() {
    this.props.toggleReport(this.props.layer.id);
  }

  onClickInfo() {
    const modalParams = {
      open: true,
      info: this.props.layer
    };

    this.props.openLayerInfoModal(modalParams);
  }

  toggleBlending() {
    this.props.onLayerBlendingToggled(this.props.layerIndex);
  }

  render() {
    const isCurrentlyReportedLayer = this.props.currentlyReportedLayerId === this.props.layer.id;
    const canReport = (this.props.userPermissions !== null && this.props.userPermissions.indexOf('reporting') !== -1);

    let actions;
    if (this.props.layerPanelEditMode === true) {
      actions = (
        <div className={LayerListStyles.editionMenu}>
          <DeleteIcon
            className={classnames(icons.icon, LayerListStyles.deleteIcon)}
            onClick={() => {
              this.props.toggleLayerWorkspacePresence(this.props.layer);
            }}
          />
        </div>
      );
    } else {
      actions = (
        <ul className={LayerListStyles.layerOptionList}>
          {canReport && this.props.layer.reportId !== undefined && <li
            className={LayerListStyles.layerOptionItem}
            onClick={() => this.onClickReport()}
          >
            <ReportIcon
              className={classnames({ [`${LayerListStyles._highlighted}`]: isCurrentlyReportedLayer })}
            />
          </li>}
          {this.props.layer.type !== LAYER_TYPES.Custom &&
          <li className={LayerListStyles.layerOptionItem}>
            <LayerBlendingOptionsTooltip
              displayHue={this.props.layer.type === LAYER_TYPES.Heatmap}
              displayOpacity
              hueValue={this.props.layer.hue}
              opacityValue={this.props.layer.opacity}
              onChangeOpacity={opacity => this.onChangeOpacity(opacity)}
              onChangeHue={hue => this.onChangeHue(hue)}
              isReverse={this.props.layerIndex < REVERSE_TOOLTIP_ITEMS_MOBILE}
              visible={this.props.showBlending}
              toggleVisibility={() => this.toggleBlending()}
            />
          </li>}
          <li
            className={LayerListStyles.layerOptionItem}
            onClick={() => this.onClickInfo()}
          >
            <InfoIcon />
          </li>
        </ul>
      );
    }

    return (
      <li
        className={LayerListStyles.layerItem}
      >
        <Toggle
          on={this.props.layer.visible}
          color={this.props.layer.color}
          hue={this.props.layer.hue}
          onToggled={() => this.onChangeVisibility()}
        />
        <input
          className={classnames(LayerListStyles.itemName, { [LayerListStyles.itemRename]: this.props.layerPanelEditMode })}
          onChange={e => this.onChangeLayerLabel(e.currentTarget.value)}
          readOnly={!this.props.layerPanelEditMode}
          value={this.props.layer.label}
          ref={((elem) => {
            this.inputName = elem;
          })}
        />
        {actions}
      </li>
    );
  }
}

LayerItem.propTypes = {
  /*
   list of restricted actions a user is allowed to perform
   */
  userPermissions: PropTypes.array,
  layerIndex: PropTypes.number,
  /*
   layer object
   */
  layer: PropTypes.object,
  currentlyReportedLayerId: PropTypes.string,
  toggleLayerVisibility: PropTypes.func,
  toggleLayerWorkspacePresence: PropTypes.func,
  toggleReport: PropTypes.func,
  setLayerOpacity: PropTypes.func,
  setLayerHue: PropTypes.func,
  openLayerInfoModal: PropTypes.func,
  onLayerBlendingToggled: PropTypes.func,
  /*
   Called when a layer title changes
   */
  setLayerLabel: PropTypes.func,
  showBlending: PropTypes.bool,
  /*
   If layer labels are editable or not
   */
  layerPanelEditMode: PropTypes.bool
};

export default LayerItem;