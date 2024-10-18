const reactJs =
  process.env.REACT_CDN ||
  'https://unpkg.com/react@18.3.1/umd/react.production.min.js';
const reactDomJs =
  process.env.REACT_DOM_CDN ||
  'https://unpkg.com/react-dom@{VERSION}/umd/react-dom.production.min.js';

module.exports =`
    function triggerEvent(event) {
    console.log('Triggering event:', event);
    document.dispatchEvent(new CustomEvent(event));
  }
  
  function checkReactDom() {
    console.log('Checking if ReactDOM is loaded...');
    if (!hasReactDom && !window.OpenStadReactDOMLoaded) {
      console.log('ReactDOM is not loaded, loading ReactDOM...');
      
      let reactVersion = React.version;
      console.log('Detected React version:', reactVersion);
      
      // Get same version of react-dom as react, ensuring we have a xx.x.x format
      if (!/18\.\d{1,2}\.\d{1,2}/.test(reactVersion) === false) {
        throw new Error('React version 18 is required');
      }
      
      const reactDomUrl = '${reactDomJs}'.replace('{VERSION}', reactVersion);
      console.log('Loading ReactDOM from URL:', reactDomUrl);
      
      const script = document.createElement('script');
      script.src = reactDomUrl;
      script.onload = function() {
        console.log('ReactDOM loaded successfully.');
        if (typeof window.createRoot === 'undefined' && typeof ReactDOM !== 'undefined' && typeof ReactDOM.createRoot !== 'undefined') {
          window.createRoot = ReactDOM.createRoot;
          console.log('createRoot function assigned to window.');
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
      console.error('Detected ReactDOM version:', ReactDOM.version);
      throw new Error('ReactDOM version 18 is required');
    } else {
      console.log('ReactDOM already loaded.');
      window.OpenStadReactDOMLoaded = true;
    }
  }


// document.addEventListener('OpenStadReactDomLoaded', renderWidget);
// triggerEvent('OpenStadReactDomLoaded');


  const hasReact = typeof React !== 'undefined';
  console.log('React present:', hasReact);
  
  const hasReactWithScheduler = hasReact && typeof React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED !== 'undefined' && typeof React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.Scheduler !== 'undefined' && typeof React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.Scheduler.unstable_scheduleCallback !== 'undefined';
  console.log('React with Scheduler available:', hasReactWithScheduler);
  
  const hasReactDom = typeof ReactDOM !== 'undefined';
  console.log('ReactDOM present:', hasReactDom);
  
  if (!hasReact && !window.OpenStadReactLoaded) {
    console.log('React is not loaded, loading React...');
    const script = document.createElement('script');
    script.src = '${reactJs}';
    script.onload = (e) => {
      console.log('React loaded successfully.');
      checkReactDom();
    }
    
    document.body.appendChild(script);
    window.OpenStadReactLoaded = true;
  } else if (hasReact && React.version.substr(0, 2) < '18') {
    console.error('Loaded React version is too low:', React.version);
    throw new Error('React version 18 is required');
  } else if (hasReact && !hasReactWithScheduler && !window.OpenStadReactLoaded) {
    console.log('React loaded but Scheduler is missing, loading React 18.3.1 UMD version...');
    
    const script = document.createElement('script');
    script.src = '${reactJs}';
    script.onload = (e) => {
      console.log('React 18.3.1 loaded successfully.');
      checkReactDom();
    }
    
    document.body.appendChild(script);
    window.OpenStadReactLoaded = true;
  } else if (hasReact && hasReactWithScheduler && !hasReactDom) {
      console.log("React loaded with Scheduler, but ReactDOM is missing. Loading ReactDOM...");
      checkReactDom();
  } else {
    console.log('React already loaded with Scheduler. Checking ReactDOM...');
    document.addEventListener('OpenStadReactDomLoaded', renderWidget);
  }

  if (hasReact && hasReactDom && hasReactWithScheduler) {
      console.log('React and ReactDOM already loaded with Scheduler. Rendering widget...');
  
      window.OpenStadReactLoaded = true;
      window.OpenStadReactDOMLoaded = true;
      document.addEventListener('OpenStadReactDomLoaded', renderWidget);
      triggerEvent('OpenStadReactDomLoaded');
  }
`;
