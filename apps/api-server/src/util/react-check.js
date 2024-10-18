const reactJs =
  process.env.REACT_CDN ||
  'https://unpkg.com/react@18.3.1/umd/react.production.min.js';
const reactDomJs =
  process.env.REACT_DOM_CDN ||
  'https://unpkg.com/react-dom@{VERSION}/umd/react-dom.production.min.js';

module.exports =`
    function loadScript(src, async = true, defer = true) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = async;
            script.defer = defer;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }

    function triggerEvent(event) {
        console.log('Triggering event:', event);
        document.dispatchEvent(new CustomEvent(event));
    }

    function checkReactDom() {
        console.log('Checking if ReactDOM is loaded...');
        const hasReactDom = typeof ReactDOM !== 'undefined';
    
        if (!hasReactDom && !window.OpenStadReactDOMLoaded) {
            console.log('ReactDOM is not loaded, loading ReactDOM...');
            const reactVersion = React.version;
            console.log('Detected React version:', reactVersion);
    
            const reactDomUrl = 'https://unpkg.com/react-dom@' + reactVersion + '/umd/react-dom.production.min.js';
            return loadScript(reactDomUrl).then(() => {
                console.log('ReactDOM loaded successfully.');
                if (typeof window.createRoot === 'undefined' && typeof ReactDOM !== 'undefined' && typeof ReactDOM.createRoot !== 'undefined') {
                    window.createRoot = ReactDOM.createRoot;
                    console.log('createRoot function assigned to window.');
                }
                window.OpenStadReactDOMLoaded = true;
                triggerEvent('OpenStadReactDomLoaded');
            });
        } else if (hasReactDom && ReactDOM.version.substr(0, 2) !== '18') {
            console.error('Detected ReactDOM version:', ReactDOM.version);
            throw new Error('ReactDOM version 18 is required');
        } else {
            console.log('ReactDOM already loaded.');
            window.OpenStadReactDOMLoaded = true;
            return Promise.resolve();
        }
    }
    
    if (typeof React === 'undefined') {
        // React is not yet loaded, load it dynamically
        const reactJsUrl = 'https://unpkg.com/react@18.3.1/umd/react.production.min.js';
        loadScript(reactJsUrl).then(() => {
            console.log('React loaded');
            checkReactDom();
        });
    } else {
        // React is already loaded, proceed with ReactDOM
        checkReactDom();
    }
    
    // Main function to initialize widgets
    function initializeWidgets() {
        if (typeof React === 'undefined') {
            // React is not yet loaded, load it dynamically
            const reactJsUrl = 'https://unpkg.com/react@18.3.1/umd/react.production.min.js';
            loadScript(reactJsUrl)
                .then(() => {
                    console.log('React loaded');
                    return checkReactDom();  // Check and load ReactDOM
                })
                .then(() => {
                    document.addEventListener('OpenStadReactDomLoaded', renderWidget);
                    triggerEvent('OpenStadReactDomLoaded');
                    console.log('Widgets initialized successfully.');
                })
                .catch(err => {
                    console.error('Error loading React or ReactDOM:', err);
                });
        } else {
            // React is already loaded, just check ReactDOM
            checkReactDom()
                .then(() => {
                    document.addEventListener('OpenStadReactDomLoaded', renderWidget);
                    triggerEvent('OpenStadReactDomLoaded');
                    console.log('Widgets initialized successfully.');
                })
                .catch(err => {
                    console.error('Error loading React or ReactDOM:', err);
                });
        }
    }
    
    // Ensure the initialization runs only after the DOM is ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initializeWidgets();
    } else {
        document.addEventListener('DOMContentLoaded', initializeWidgets);
    }
`;
