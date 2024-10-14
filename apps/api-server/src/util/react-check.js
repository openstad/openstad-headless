const reactJs =
  process.env.REACT_CDN ||
  'https://unpkg.com/react@18.2.0/umd/react.production.min.js';
const reactDomJs =
  process.env.REACT_DOM_CDN ||
  'https://unpkg.com/react-dom@{VERSION}/umd/react-dom.production.min.js';

module.exports = `
  function triggerEvent() {
    document.dispatchEvent(new CustomEvent('OpenStadReactLoaded'));
  }
  
  function checkReactDom() {
    if (!hasReactDom && !reactDomLoaded) {
    
      if (!reactVersion) {
        reactVersion = React.version;
      }
      
      // Get same version of react-dom as react, ensuring we have a xx.x.x format
      if (!/18\.\d{1,2}\.\d{1,2}/.test(reactVersion) === false) {
        throw new Error('React version 18 is required');
      }
      
      const reactDomUrl = '${reactDomJs}'.replace('{VERSION}', reactVersion);
    
      const script = document.createElement('script');
      script.src = reactDomUrl;
      script.onload = function() {
        if (typeof window.createRoot === 'undefined' && typeof ReactDOM !== 'undefined' && typeof ReactDOM.createRoot !== 'undefined') {
          window.createRoot = ReactDOM.createRoot;
        }
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
  let reactVersion = hasReact ? React.version : '';

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
