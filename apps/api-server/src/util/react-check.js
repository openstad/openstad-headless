const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Version tag for the runtime script URL, so browsers fetch a fresh runtime
// whenever its content changes (a stale cached runtime next to newer widget
// bundles triggers React's strict version check and breaks rendering).
let runtimeVersion = null;
function getRuntimeVersion() {
  if (runtimeVersion) return runtimeVersion;
  try {
    const runtime = fs.readFileSync(
      path.resolve(__dirname, '../../dist/openstad-react-runtime.js')
    );
    runtimeVersion = crypto
      .createHash('md5')
      .update(runtime)
      .digest('hex')
      .slice(0, 12);
  } catch (err) {
    runtimeVersion = require('react-dom/package.json').version;
  }
  return runtimeVersion;
}

module.exports = function (apiUrl) {
  return `
  function triggerEvent(event) {
    document.dispatchEvent(new CustomEvent(event));
  }

  function openStadReactDomLoadedEventHasFired() {
    window.OpenStadReactDomLoadedEventHasFired = true;
  }

  document.addEventListener('OpenStadReactDomLoaded', openStadReactDomLoadedEventHasFired);

  function checkReactLoaded() {
    if (typeof window.OpenStadReact !== 'undefined' && typeof window.OpenStadReactDOM !== 'undefined' && typeof window.OpenStadReactDOMServer !== 'undefined' && typeof window.OpenStadReactDOM.createRoot === 'function') {
      if (typeof window.OpenStadReactDomLoadedEventHasFired === 'undefined' || !window.OpenStadReactDomLoadedEventHasFired) {
        document.addEventListener('OpenStadReactDomLoaded', renderWidget);
        triggerEvent('OpenStadReactDomLoaded');
      } else {
        renderWidget();
      }
      return;
    }

    if (window.OpenStadReactIsLoading) {
      document.addEventListener('OpenStadReactDomLoaded', renderWidget);
      return;
    }

    window.OpenStadReactIsLoading = true;

    const script = document.createElement('script');
    script.src = '${apiUrl}/widget/react-runtime.js?v=${getRuntimeVersion()}';
    script.onload = function() {
      document.addEventListener('OpenStadReactDomLoaded', renderWidget);
      triggerEvent('OpenStadReactDomLoaded');
    };
    script.onerror = function() {
      console.error('Failed to load OpenStad React runtime');
    };
    document.body.appendChild(script);
  }

  checkReactLoaded();
`;
};
