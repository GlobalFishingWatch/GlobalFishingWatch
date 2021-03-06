import PropTypes from 'prop-types'
import React, { Component } from 'react'
import classnames from 'classnames'
import ShareStyles from 'styles/components/map/share.module.scss'
import iconStyles from 'styles/icons.module.scss'
import { ReactComponent as FacebookIcon } from 'assets/icons/facebook.svg'
import { ReactComponent as TwitterIcon } from 'assets/icons/twitter.svg'
import { ReactComponent as GooglePlusIcon } from 'assets/icons/google-plus.svg'
import { EMBED_SIZE_SETTINGS, DEFAULT_EMBED_SIZE } from 'app/config'

class Share extends Component {
  constructor(props) {
    super(props)

    this.state = {
      copied: false, // If the input's content has been copied
      copyError: false, // If the copy action failed
      display: 'link',
      embedSizeName: DEFAULT_EMBED_SIZE,
    }
  }

  setDisplay(display) {
    this.setState({
      display,
    })
  }

  /**
   * Copy the input's content into the clipboard and set the state's "copied"
   * attribute to true. If the action failed, set the "copyError" attribute to
   * true. After few milliseconds, the "copied" attribute is resetted to false
   * to display a quick visual feedback.
   *
   * @param {object} e - click event on the button
   */
  onCopy(e) {
    e.preventDefault()

    this.input.select()

    let error = false
    try {
      if (!document.execCommand('copy')) error = true
    } catch (err) {
      error = true
    }

    this.setState({
      copied: !error,
      error,
    })

    /* We want the copied state to only last few millisecond to display a visual
     * feedback */
    if (!error) setTimeout(() => this.setState({ copied: false }), 1000)
  }

  /**
   * Return the URL of the page with the workspace id included
   *
   * @returns {string} URL
   */
  getURLWithWorkspace() {
    if (process.env.REACT_APP_SHARE_BASE_URL) {
      return process.env.REACT_APP_SHARE_BASE_URL.replace('{workspace_id}', this.props.workspaceId)
    }
    return `${window.location.origin}${window.location.pathname.replace(/\/$/g, '')}/?workspace=${
      this.props.workspaceId
    }`
  }

  updateEmbedSize(event) {
    this.setState({
      embedSizeName: event.target.value,
    })
  }

  openFacebook() {
    const url = this.getURLWithWorkspace()

    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`)
  }

  openGooglePlus() {
    const url = this.getURLWithWorkspace()

    window.open(`https://plus.google.com/share?url=${url}`)
  }

  openTwitter() {
    const url = this.getURLWithWorkspace()

    window.open(`https://twitter.com/share?url=${url}`)
  }

  renderSocialNetworks() {
    return (
      <div className={ShareStyles.socialLinks}>
        <button
          className={classnames(ShareStyles.socialButton, ShareStyles._facebook)}
          onClick={(e) => this.openFacebook(e)}
        >
          <span className={ShareStyles.buttonContainer}>
            <FacebookIcon className={classnames(iconStyles.icon, ShareStyles.facebookIcon)} />
            <span className={ShareStyles.buttonText}>facebook</span>
          </span>
        </button>
        <button
          className={classnames(ShareStyles.socialButton, ShareStyles._googleplus)}
          onClick={(e) => this.openGooglePlus(e)}
        >
          <span className={ShareStyles.buttonContainer}>
            <GooglePlusIcon className={classnames(iconStyles.icon, ShareStyles.googlePlusIcon)} />
            <span className={ShareStyles.buttonText}>Google</span>
          </span>
        </button>
        <button
          className={classnames(ShareStyles.socialButton, ShareStyles._twitter)}
          onClick={(e) => this.openTwitter(e)}
        >
          <span className={ShareStyles.buttonContainer}>
            <TwitterIcon className={classnames(iconStyles.icon, ShareStyles.twitterIcon)} />
            <span className={ShareStyles.buttonText}>Twitter</span>
          </span>
        </button>
      </div>
    )
  }

  renderLink() {
    const url = this.getURLWithWorkspace()
    return (
      <div className={ShareStyles.content}>
        <p className={ShareStyles.intro}>Copy and paste the link into an email or IM</p>
        <form>
          <input
            className={ShareStyles.shareInput}
            type="text"
            readOnly
            value={url}
            ref={(input) => {
              this.input = input
            }}
          />
          <button className={ShareStyles.copyButton} type="submit" onClick={(e) => this.onCopy(e)}>
            {this.state.copied ? 'Copied!' : 'Copy'}
          </button>
        </form>
      </div>
    )
  }

  renderEmbed() {
    // TODO share url should be built in a more centralized wayee from a reducer
    const url = this.getURLWithWorkspace()
    const urlSeparator = url.match(/\?/gi) ? '&' : '?'
    const size = EMBED_SIZE_SETTINGS.find((elem) => elem.name === this.state.embedSizeName)
    const embed = `<iframe allowfullscreen="true"
    width="${size.width}" height="${size.height}" src="${url}${urlSeparator}embedded=true" />`

    const selectOptions = EMBED_SIZE_SETTINGS.map((option) => (
      <option key={option.name} value={option.name}>
        {option.name} ({option.width}x{option.height})
      </option>
    ))

    return (
      <div className={ShareStyles.content}>
        <form>
          <div className={ShareStyles.embedContainer}>
            <p className={ShareStyles.intro}>Embed Size</p>
            <select
              className={ShareStyles.shareInput}
              onChange={(event) => this.updateEmbedSize(event)}
              value={this.state.embedSizeName}
            >
              {selectOptions}
            </select>
          </div>
          <div className={ShareStyles.embedContainer}>
            <p className={ShareStyles.intro}>Embed in your site</p>
            <div>
              <input
                className={ShareStyles.shareInput}
                type="text"
                readOnly
                value={embed}
                ref={(input) => {
                  this.input = input
                }}
              />
              <button
                className={ShareStyles.copyButton}
                type="submit"
                onClick={(e) => this.onCopy(e)}
              >
                {this.state.copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </form>
      </div>
    )
  }

  render() {
    if (this.props.error) {
      return (
        <div className={ShareStyles.share}>
          <h2 className={ShareStyles.title}>Share this map</h2>
          <p>Sorry, an error prevented the workspace to be saved. Try again.</p>
        </div>
      )
    }

    if (!this.props.workspaceId) {
      return (
        <div className={ShareStyles.share}>
          <h2 className={ShareStyles.title}>Share this map</h2>
          <p>Saving your workspace...</p>
        </div>
      )
    }

    const copyError = (
      <p className={ShareStyles.copyError}>
        Sorry, the link couldn&#39;t be copied. Please right click on the input and copy it
        manually.
      </p>
    )
    const socialNetworks = this.renderSocialNetworks()

    return (
      <div className={ShareStyles.share}>
        <h2 className={ShareStyles.title}>Share this map</h2>
        <div className={ShareStyles.contentSwitcher}>
          <span
            className={classnames(ShareStyles.contentOption, {
              [`${ShareStyles._selected}`]: this.state.display === 'link',
            })}
            onClick={() => this.setDisplay('link')}
          >
            Link
          </span>
          <span
            className={classnames(ShareStyles.contentOption, {
              [`${ShareStyles._selected}`]: this.state.display === 'embed',
            })}
            onClick={() => this.setDisplay('embed')}
          >
            Embed
          </span>
        </div>
        {this.state.display === 'link' && this.renderLink()}
        {this.state.display === 'embed' && this.renderEmbed()}
        <div className={ShareStyles.separator}>
          <span className={ShareStyles.wordSeparator}>or</span>
        </div>
        {socialNetworks}
        {this.state.error && copyError}
      </div>
    )
  }
}

Share.propTypes = {
  /**
   * Id of the created workspace
   */
  workspaceId: PropTypes.string,
  /**
   * Possible error due to failed request to save the workspace
   */
  error: PropTypes.string,
}

export default Share
