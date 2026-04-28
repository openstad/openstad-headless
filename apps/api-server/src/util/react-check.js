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
    script.src = '${apiUrl}/widget/react-runtime.js';
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
