const reactJs =
  process.env.REACT_CDN ||
  'https://unpkg.com/react@18.3.1/umd/react.production.min.js';
const reactDomJs =
  process.env.REACT_DOM_CDN ||
  'https://unpkg.com/react-dom@{VERSION}/umd/react-dom.production.min.js';

module.exports = `
  function triggerEvent(event) {
    document.dispatchEvent(new CustomEvent(event));
  }
  
  function openStadReactDomLoadedEventHasFired() {
    window.OpenStadReactDomLoadedEventHasFired = true;
  }
  
  document.addEventListener('OpenStadReactDomLoaded', openStadReactDomLoadedEventHasFired);
  
  function checkReactDom() {
    if (!hasReactDom && !window.OpenStadReactDOMLoaded) {
    
      let reactVersion = React.version;
      
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
        document.addEventListener('OpenStadReactDomLoaded', renderWidget);
        triggerEvent('OpenStadReactDomLoaded');
      }
      document.body.appendChild(script);
      window.OpenStadReactDOMLoaded = true;
    } else if (
        typeof ReactDOM !== 'undefined' &&
        ReactDOM.version.substr(0, 2) !== '18'
    ) {
      throw new Error('ReactDOM version 18 is required');
    } else {
      window.OpenStadReactDOMLoaded = true;
      document.addEventListener('OpenStadReactDomLoaded', renderWidget);
      triggerEvent('OpenStadReactDomLoaded');
    }
  }

  const hasReact = typeof React !== 'undefined';
  const hasReactWithScheduler = hasReact && typeof React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED !== 'undefined' && typeof React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.Scheduler !== 'undefined' && typeof React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.Scheduler.unstable_scheduleCallback !== 'undefined';
  const hasReactDom = typeof ReactDOM !== 'undefined';
  
  if (!hasReact && !window.OpenStadReactLoaded) {
    const script = document.createElement('script');
    script.src = '${reactJs}';
    script.onload = (e) => {
      checkReactDom();
    }
    
    document.body.appendChild(script);
    window.OpenStadReactLoaded = true;
  } else if (hasReact && React.version.substr(0, 2) < '18') {
    throw new Error('React version 18 is required');
  } else if (hasReact && !hasReactWithScheduler && !window.OpenStadReactLoaded) {
    console.log ('Loading React 18.3.1 UMD version -- current version is without Scheduler which means React DOM won\\'t load correctly.');
    
    const script = document.createElement('script');
    script.src = '${reactJs}';
    script.onload = (e) => {
      checkReactDom();
    }
    
    document.body.appendChild(script);
    window.OpenStadReactLoaded = true;
  } else {
    if (typeof window.OpenStadReactDomLoadedEventHasFired === 'undefined' || !window.OpenStadReactDomLoadedEventHasFired) {
      // React has been loaded by a previous component on the page, render the widget when ReactDOM is loaded
      document.addEventListener('OpenStadReactDomLoaded', renderWidget);
      checkReactDom();
    } else {
      renderWidget();
    }
  }
`;
