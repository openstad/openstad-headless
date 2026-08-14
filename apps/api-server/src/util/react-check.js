const fs = require('fs');
const path = require('path');

// Cache-bust the runtime URL by its build time. The runtime is served with a
// 24h max-age AND injected as a dynamic <script>, so a stale copy survives even
// a hard refresh; a changing ?v= forces the browser to refetch when it changes.
// ponytail: mtime is enough; only changes when the runtime is rebuilt.
function runtimeVersion() {
  try {
    return fs
      .statSync(path.resolve(__dirname, '../../dist/openstad-react-runtime.js'))
      .mtimeMs.toString();
  } catch {
    return '0';
  }
}

module.exports = function (apiUrl) {
  const v = runtimeVersion();
  return `
  function triggerEvent(event) {
    document.dispatchEvent(new CustomEvent(event));
  }

  function openStadReactDomLoadedEventHasFired() {
    window.OpenStadReactDomLoadedEventHasFired = true;
  }

  document.addEventListener('OpenStadReactDomLoaded', openStadReactDomLoadedEventHasFired);

  function checkReactLoaded() {
    if (typeof window.OpenStadReact !== 'undefined' && typeof window.OpenStadReactDOM !== 'undefined' && typeof window.OpenStadReactDOM.createRoot === 'function') {
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
    script.src = '${apiUrl}/widget/react-runtime.js?v=${v}';
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
