import React, { useCallback, useEffect, useRef, useState } from 'react';

type PluginComponentLoaderProps = {
  pluginName: string;
  bundleType: 'admin' | 'widget-admin';
  componentName: string;
  props?: Record<string, any>;
  apiUrl?: string;
};

declare global {
  interface Window {
    __openstad_plugin_props?: Record<string, Record<string, any>>;
    [key: `OpenStadPlugin_${string}`]: Record<string, any> | undefined;
  }
}

export default function PluginComponentLoader({
  pluginName,
  bundleType,
  componentName,
  props = {},
  apiUrl,
}: PluginComponentLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const unmountRef = useRef<((container: HTMLElement) => void) | null>(null);
  const propsRef = useRef(props);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );
  const [errorMessage, setErrorMessage] = useState<string>('');
  const cacheBuster = useRef(Date.now());

  // Keep propsRef in sync
  propsRef.current = props;

  // Build the bundle URL from the api-server
  const resolvedApiUrl = apiUrl || process.env.NEXT_PUBLIC_API_URL || '';
  const bundleUrl = `${resolvedApiUrl}/api/plugin/bundle/${pluginName}/${bundleType}?v=${cacheBuster.current}`;

  const loadBundle = useCallback(() => {
    // Set plugin props on window so the IIFE can read them
    if (!window.__openstad_plugin_props) {
      window.__openstad_plugin_props = {};
    }
    window.__openstad_plugin_props[pluginName] = propsRef.current;

    // Remove any existing script for this plugin/bundleType
    if (scriptRef.current) {
      scriptRef.current.remove();
      scriptRef.current = null;
    }

    // Clean up previous mount
    if (unmountRef.current && containerRef.current) {
      unmountRef.current(containerRef.current);
      unmountRef.current = null;
    }

    const script = document.createElement('script');
    script.src = bundleUrl;
    script.async = true;
    script.setAttribute('data-plugin', pluginName);
    script.setAttribute('data-bundle-type', bundleType);

    script.onload = () => {
      const globalKey = `OpenStadPlugin_${pluginName}` as const;
      const pluginExports = window[globalKey];

      if (!pluginExports) {
        setStatus('error');
        setErrorMessage(
          `Plugin "${pluginName}" loaded but window.${globalKey} not found`
        );
        return;
      }

      // Prefer mount/unmount pattern (plugin self-renders with its own React)
      if (typeof pluginExports.mount === 'function') {
        if (containerRef.current) {
          pluginExports.mount(containerRef.current, propsRef.current);
          unmountRef.current = pluginExports.unmount || null;
          setStatus('ready');
        }
        return;
      }

      // Fallback: try rendering component via host React (same-version only)
      if (typeof pluginExports[componentName] === 'function') {
        const ReactDOM = require('react-dom/client');
        if (containerRef.current) {
          const root = ReactDOM.createRoot(containerRef.current);
          const PluginComponent = pluginExports[componentName];
          root.render(React.createElement(PluginComponent, propsRef.current));
          unmountRef.current = () => root.unmount();
          setStatus('ready');
        }
        return;
      }

      setStatus('error');
      setErrorMessage(
        `Plugin "${pluginName}" loaded but no mount() or "${componentName}" found on window.${globalKey}`
      );
    };

    script.onerror = () => {
      setStatus('error');
      setErrorMessage(`Failed to load plugin bundle from ${bundleUrl}`);
    };

    document.body.appendChild(script);
    scriptRef.current = script;
  }, [pluginName, bundleType, componentName, bundleUrl]);

  // Load bundle on mount
  useEffect(() => {
    loadBundle();

    return () => {
      // Cleanup on unmount
      if (unmountRef.current && containerRef.current) {
        unmountRef.current(containerRef.current);
        unmountRef.current = null;
      }
      if (scriptRef.current) {
        scriptRef.current.remove();
        scriptRef.current = null;
      }
      // Clean up globals (IIFE var declarations are non-configurable, so use try/catch)
      try {
        const globalKey = `OpenStadPlugin_${pluginName}` as const;
        (window as any)[globalKey] = undefined;
      } catch (_) {}
      if (window.__openstad_plugin_props) {
        delete window.__openstad_plugin_props[pluginName];
      }
    };
  }, [loadBundle]);

  // Update props without reloading the bundle (uses deep comparison)
  const serializedProps = JSON.stringify(props);
  useEffect(() => {
    if (window.__openstad_plugin_props) {
      window.__openstad_plugin_props[pluginName] = props;
    }

    // Re-mount with updated props if already ready
    if (status === 'ready' && containerRef.current) {
      const globalKey = `OpenStadPlugin_${pluginName}` as const;
      const pluginExports = window[globalKey];
      if (pluginExports && typeof pluginExports.mount === 'function') {
        pluginExports.mount(containerRef.current, props);
      }
    }
  }, [serializedProps, pluginName, status]);

  if (status === 'error') {
    return (
      <div className="p-6 bg-white rounded-md">
        <p className="text-red-600">Plugin kon niet worden geladen</p>
        <p className="text-sm text-gray-500 mt-2">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div>
      {status === 'loading' && (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      )}
      <div
        ref={containerRef}
        style={{ display: status === 'loading' ? 'none' : 'block' }}
      />
    </div>
  );
}
