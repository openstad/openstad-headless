const reactJs =
  process.env.REACT_CDN ||
  'https://unpkg.com/react@18.2.0/umd/react.production.min.js';
const reactDomJs =
  process.env.REACT_DOM_CDN ||
  'https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js';

module.exports = `
  function triggerEvent() {
    document.dispatchEvent(new CustomEvent('OpenStadReactLoaded'));
  }
  
  function checkReactDom() {
    if (!hasReactDom && !reactDomLoaded) {
      const script = document.createElement('script');
      script.src = '${reactDomJs}';
      script.onload = function() {
        document.addEventListener('OpenStadReactLoaded', renderWidget);
        triggerEvent();
      }
      document.body.appendChild(script);
    } else if (
        typeof ReactDOM !== 'undefined' &&
        ReactDOM.version.substr(0, 2) !== '18'
    ) {
      throw new Error('ReactDOM version 18 is required');
    } else {
      document.addEventListener('OpenStadReactLoaded', renderWidget);
      triggerEvent();
    }
  }

  const hasReact = typeof React !== 'undefined';
  const reactLoaded = window.OpenStadReactLoaded;
  const hasReactDom = typeof ReactDOM !== 'undefined';
  const reactDomLoaded = window.OSReactDomLoaded;

  if (!hasReact && !reactLoaded) {
    const script = document.createElement('script');
    script.src = '${reactJs}';
    script.onload = (e) => {
      checkReactDom();
    }
    
    document.body.appendChild(script);
    window.OpenStadReactLoaded = true;
  } else if (hasReact && React.version.substr(0, 2) < '18') {
    throw new Error('React version 18 is required');
  } else {
    checkReactDom();
  }
`;
