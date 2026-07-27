import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useWidgetConfig } from './use-widget-config';

export function useWidgetPreview<T extends { [key: string]: any }>(
  widgetSettings: Partial<{
    [key in keyof T]: T[key];
  }>,
  idOverride?: string
): {
  previewConfig: T | undefined;
  updatePreview: (arg: T | ((prev: T | undefined) => T)) => void;
} {
  const [previewConfig, setPreviewConfig] = useState<T>();
  const { data: widget, isLoading: isLoadingWidget } =
    useWidgetConfig<T>(idOverride);
  const router = useRouter();
  const widgetId = idOverride ?? router.query.id;
  const seededWidgetIdRef = useRef<string | undefined>(undefined);

  // Seed the preview when the widget config loads, and RESEED whenever the
  // widget id changes. Navigating between two widgets of the same type keeps
  // this hook mounted, so a plain `if (!previewConfig)` guard would keep the
  // previous widget's config in the draft — the dirty check would then compare
  // against the wrong widget and a save could write widget A's config onto
  // widget B. Keying on the widget id (not on config identity) also means a
  // background SWR revalidation of the *same* widget never clobbers an
  // in-progress edit.
  useEffect(() => {
    const currentId = Array.isArray(widgetId) ? widgetId[0] : widgetId;
    if (previewConfig && seededWidgetIdRef.current === currentId) return;

    const config = widget?.config;
    if (!config) return;
    if (typeof config === 'object') {
      (config as any).showAdminHiddenPolygonStyling = true;
    }

    seededWidgetIdRef.current = currentId;
    setPreviewConfig({
      ...config,
      ...widgetSettings,
      widgetId,
    });
  }, [widget?.config, widgetId, previewConfig, widgetSettings]);

  // Accepts a value or a functional updater. The updater form lets several
  // field pushes in the same tick compose correctly instead of clobbering each
  // other (each receives the latest pending draft, not a stale snapshot).
  //
  // Memoized with a stable identity: `onFieldChanged`/`save` in useWidgetDraft
  // depend on this, and useSyncDraftForm's effect depends on `onFieldChanged`.
  // An unstable identity here made that effect tear down on every render and
  // its cleanup cancel the pending field debounce — silently dropping an edit
  // if any render landed inside the 300ms window. setPreviewConfig is stable,
  // so an empty dep list is correct.
  const updatePreview = useCallback(
    (config: T | ((prev: T | undefined) => T)) => {
      setPreviewConfig(config as any);
    },
    []
  );
  return { previewConfig, updatePreview };
}
