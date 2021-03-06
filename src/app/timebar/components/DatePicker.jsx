import PropTypes from 'prop-types'
import React, { Component } from 'react'
import moment from 'moment'
import ReactDatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import classnames from 'classnames'
import 'styles/components/map/datepicker.module.scss'

class DatePicker extends Component {
  constructor(props) {
    super(props)
    this.onChange = this.onChange.bind(this)
  }

  onChange(m) {
    // convert moment to date
    this.props.onChange(m.clone().toDate())
  }

  render() {
    return (
      <div className={classnames(['datepicker', { endDatePicker: this.props.label === 'end' }])}>
        <div className="datepickerTitle">{this.props.label}</div>
        <ReactDatePicker
          fixedHeight
          className="datepickerInput"
          customInput={<textarea />}
          calendarClassName={classnames(['calendar', this.props.calendarPosition])}
          showYearDropdown
          dropdownMode="select"
          readOnly
          dateFormat="DD MMM YYYY"
          selected={moment(this.props.selected)}
          minDate={moment(this.props.minDate)}
          maxDate={moment(this.props.maxDate)}
          onChange={this.onChange}
        />
      </div>
    )
  }
}

DatePicker.propTypes = {
  onChange: PropTypes.func,
  /**
   * title of the datepicker
   */
  label: PropTypes.string,
  /**
   * Current  date set (a Date object)
   */
  selected: PropTypes.object,
  /**
   * Minimum allowed start date (a Date object).
   */
  minDate: PropTypes.object,
  /**
   * Maximum allowed start date (a Date object).
   */
  maxDate: PropTypes.object,
  /**
   * Position of the tooltip calendar related to the screen
   * (null is down left of the screen, rightCalendar is down right)
   */
  calendarPosition: PropTypes.string,
}

export default DatePicker
