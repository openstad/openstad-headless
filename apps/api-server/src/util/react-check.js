const reactJs =
  process.env.REACT_CDN ||
  'https://unpkg.com/react@18.2.0/umd/react.production.min.js';
const reactDomJs =
  process.env.REACT_DOM_CDN ||
  'https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js';

module.exports = `
  function triggerEvent() {
    document.dispatchEvent(reactLoadedEvent);
  }
  
  const reactLoadedEvent = new CustomEvent('OpenStadReactLoaded');
  
  if (typeof React === 'undefined' && !window.OpenStadReactLoaded) {
    const script = document.createElement('script');
    script.src = '${reactJs}';
    document.body.appendChild(script);
    window.OpenStadReactLoaded = true;
  } else if (
    typeof React !== 'undefined' &&
    React.version.substr(0, 2) !== '18'
  ) {
    throw new Error('React version 18 is required');
  }
  
  if (typeof ReactDOM === 'undefined' && !window.OSReactDomLoaded) {
    const script = document.createElement('script');
    script.src = '${reactDomJs}';
    script.onload = triggerEvent;
    document.body.appendChild(script);
    window.OSReactDomLoaded = true;
    document.addEventListener('OpenStadReactLoaded', renderWidget);
  } else if (
    typeof ReactDOM !== 'undefined' &&
    ReactDOM.version.substr(0, 2) !== '18'
  ) {
    throw new Error('ReactDOM version 18 is required');
  } else {
    document.addEventListener('OpenStadReactLoaded', renderWidget);
  }
/*/!*`;*!/*/
