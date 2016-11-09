import React, { Component } from 'react';
import classnames from 'classnames';
import { Link } from 'react-router';
import iconInfoBlack from '../../../assets/icons/info_black.svg';
import ToolTipStyle from '../../../styles/components/c-tooltip-info.scss';

class ToolTip extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      arrowLeft: false,
      arrowRight: false,
      positionX: 0
    };
  }

  componentDidMount() {
    if (this.isTouchDevice()) {
      this.attachTouchEndListener();
    }
  }

  onClick(e) {
    if (!this.isTouchDevice()) return;

    if (this.state.visible) {
      // We don't want the tooltip to close when touching it
      if (!(this.refs.tooltip && this.refs.tooltip.contains(e.target))) {
        this.hideTooltip();
      }
    } else {
      this.showToolTip();
    }
  }

  onMouseEnter() {
    if (this.isTouchDevice()) return;
    this.showToolTip();
  }

  onMouseLeave() {
    if (this.isTouchDevice()) return;
    this.hideTooltip();
  }

  /**
   * Detect if the user's device is touch-based
   *
   * @returns {Boolean} true if touch-based
   */
  isTouchDevice() {
    return (('ontouchstart' in window)
      || (navigator.maxTouchPoints > 0)
      || (navigator.msMaxTouchPoints > 0));
  }

  showToolTip() {
    // The height of tooltip is 80px -> 40px
    // The width of tooltip is 200px

    const tooltipWidth = 200;
    const tooltipHeight = 80;


    const bounds = this.refs.info.getBoundingClientRect();
    const left = bounds.left; // Horizontal position relative to the screen
    const height = bounds.height; // Height icon
    const width = bounds.width; // Width icon
    const offset = 10; // Distance between tooltip and icon

    const top = bounds.top + window.scrollY + height + offset; // Calc position top normal tooltip
    const topRight = bounds.top + window.scrollY - (tooltipHeight / 2) + (height / 2);
    const topLeft = bounds.top + window.scrollY - (tooltipHeight / 2) + (height / 2);
    const leftP = left - (tooltipWidth / 2) + (width / 2); // Calc position left normal tooltip
    const leftRight = left - tooltipWidth - width; // Calc position left tooltip with arrow at right
    const leftLeft = left + width + offset; // Calc position left tooltip with arrow at left
    const arrowRight = left + (tooltipWidth / 2) >= window.innerWidth;
    const arrowLeft = left - (tooltipWidth / 2) <= 0;

    // FINAL CALC
    let topTooltip = `${top}px`;
    let leftTooltip = `${leftP}px`;
    const topRightToolTip = `${topRight}px`;
    const leftRightToolTip = `${leftRight}px`;
    const topLeftToolTip = `${topLeft}px`;
    const leftLefttToolTip = `${leftLeft}px`;

    if (arrowLeft) { // If tooltip out window
      topTooltip = topLeftToolTip;
      leftTooltip = leftLefttToolTip;
    } else if (arrowRight) { // If tooltip out window
      topTooltip = topRightToolTip;
      leftTooltip = leftRightToolTip;
    }

    this.setState({
      arrowRight,
      arrowLeft,
      visible: true,
      topTooltip,
      leftTooltip
    });
  }

  hideTooltip() {
    this.setState({
      visible: false
    });
  }

  attachTouchEndListener() {
    document.body.addEventListener('touchend', e => {
      if (!this.state.visible) return;
      // We just want to hide the tooltip when touching anything else but the tooltip or the abbr
      if (!(this.refs.el && this.refs.el.contains(e.target))) {
        this.hideTooltip();
      }
    });
  }

  render() {
    let content;
    if (this.state.visible) {
      let link;
      if (this.props.href) {
        link = (<Link className={ToolTipStyle['c-tooltip-info-link']} to={this.props.href}>
          read more...
        </Link>);
      }
      content = (
        <span
          className={classnames({
            [ToolTipStyle['c-tooltip-info-content']]: true,
            [ToolTipStyle['-right']]: !!this.state.arrowRight,
            [ToolTipStyle['-left']]: !!this.state.arrowLeft
          })}
          style={{
            top: this.state.topTooltip,
            left: this.state.leftTooltip
          }}
          ref="tooltip"
        >
        {this.props.text}<br />
        {link}
        </span>);
    }
    return (
      <abbr
        title={this.props.text}
        className={classnames(ToolTipStyle['c-tooltip-info'], ToolTipStyle[`-${this.props.iconColor || 'gray'}`])}
        onClick={e => this.onClick(e)}
        onMouseEnter={() => this.onMouseEnter()}
        onMouseLeave={() => this.onMouseLeave()}
        ref="el"
      >
        <span
          className={ToolTipStyle['c-tooltip-info-title']}

        >
          {this.props.children}
          <img
            ref="info"
            src={iconInfoBlack}
            className={ToolTipStyle['image-icon']}
            alt="icon info"
          />
        </span>
        {content}
      </abbr>
    );
  }
}

ToolTip.propTypes = {
  iconColor: React.PropTypes.string,
  text: React.PropTypes.string,
  href: React.PropTypes.string,
  children: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.element
  ])
};


export default ToolTip;
