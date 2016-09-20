import React from 'react';

/**
 * Fetches the AMP document at a given `src` URL and renders it via Shadow DOM.
 */
export default class AMPDocument extends React.Component {
  constructor(props) {
    super(props);

    // 'offline' is set to true if and when the document fetch fails.
    this.state = {'offline': false};

    /**
     * `window.AMP` is set by the AMP runtime when it finishes loading.
     * @private
     */
    this.ampReadyPromise_ = new Promise(resolve => {
      (window.AMP = window.AMP || []).push(resolve);
    });

    /**
     * Child element that the AMP document will be added as a shadow root to.
     * @private
     */
    this.container_ = null;

    /**
     * XMLHTTPRequest that fetches the AMP document.
     * @private
     */
    this.xhr_ = null;
  }

  componentDidMount() {
    this.fetchAndAttachAMPDoc_(this.props.src);
  }

  componentWillUnmount() {
    if (this.xhr_) {
      this.xhr_.abort();
      this.xhr_ = null;
    }
  }

  componentWillReceiveProps(nextProps) {
    this.fetchAndAttachAMPDoc_(nextProps.src);
  }

  render() {
    if (this.state.offline) {
      return (
        <div>
          <h2>Houston, we have a problem.</h2>
          <p>Looks like we are offline&mdash;please check your Internet connection.</p>
        </div>
      );
    } else {
      return (<div className='amp-container' ref={ref => this.container_ = ref} />);
    }
  }

  /**
   * Fetches the AMP document at `url` and attaches it as a shadow root.
   * @private
   * @param {string} url
   */
  fetchAndAttachAMPDoc_(url) {
    this.fetchDocument_(url).then(doc => {
      return this.ampReadyPromise_.then(amp => {
        amp.attachShadowDoc(this.container_, doc, url);
      });
    }).catch(error => {
      this.setState({'offline': true});
    });
  }

  /**
   * Fetches and parses HTML at `url`.
   * @private
   * @param {string} url
   * @return {Promise} If fetch succeeds, resolved with {Document}.
   *         Otherwise, rejects with {string} error description.
   */
  fetchDocument_(url) {
    return new Promise((resolve, reject) => {
      const xhr = (this.xhr_ = new XMLHttpRequest());
      xhr.open('GET', url, true);
      xhr.responseType = 'document';
      // This is set to text/* instead of text/html because the development server
      // only forwards requests to the proxy for requests whose 'Accept' header
      // is NOT text/html.
      // https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#proxying-api-requests-in-development
      xhr.setRequestHeader('Accept', 'text/*');
      xhr.onreadystatechange = () => {
        if (xhr.readyState < /* STATUS_RECEIVED */ 2) {
          return;
        }
        if (xhr.status < 100 || xhr.status > 599) {
          xhr.onreadystatechange = null;
          reject(new Error(`Unknown HTTP status ${xhr.status}`));
          return;
        }
        if (xhr.readyState === /* COMPLETE */ 4) {
          if (xhr.responseXML) {
            resolve(xhr.responseXML);
          } else {
            reject(new Error('No xhr.responseXML'));
          }
        }
      };
      xhr.onerror = () => { reject(new Error('Network failure')); };
      xhr.onabort = () => { reject(new Error('Request aborted')); };
      xhr.send();
    });
  }
}
AMPDocument.propTypes = { src: React.PropTypes.string.isRequired }