import {
  useRegisterSave,
  useSaveController,
} from '@/components/ui/save-controller';
import cloneDeep from 'lodash/cloneDeep';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import set from 'lodash/set';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { useWidgetConfig } from './use-widget-config';
import { flushAllFields, registerFieldFlusher } from './useFieldDebounce';
import { useWidgetPreview } from './useWidgetPreview';

// Minimal structural type for a zod schema so we don't couple to a zod version.
type DraftSchema = {
  safeParse: (value: any) => {
    success: boolean;
    data?: any;
    error?: { issues?: Array<{ message?: string }> };
  };
};

// Save-time validators of the tabs the user has VISITED, keyed by tab label.
// Each returns ok=false with a message when its form fails validation, so a save
// can be blocked and the bar can point the user at the offending tab.
//
// A validator persists after its tab unmounts (Radix unmounts inactive tabs):
// on unmount the live validator is replaced by a frozen snapshot of the tab's
// last form values, so a tab edited into an invalid state still blocks the save
// after the user switches away — otherwise the invalid value stays in the draft
// with no validator left to catch it. Re-mounting the tab replaces the snapshot
// with a fresh live validator. The whole registry is cleared per-widget (see
// clearDraftValidators) so a stale validator never leaks to another widget.
// Never-opened tabs register nothing and keep their already-saved values.
type DraftValidator = () => { ok: boolean; label?: string; message?: string };
const draftValidators = new Map<string, DraftValidator>();

function clearDraftValidators() {
  draftValidators.clear();
}

function runDraftValidators(): { ok: boolean; message?: string } {
  for (const validate of Array.from(draftValidators.values())) {
    const result = validate();
    if (!result.ok) {
      const label = result.label ? `${result.label}: ` : '';
      return {
        ok: false,
        message: `${label}${result.message || 'controleer de invoer.'}`,
      };
    }
  }
  return { ok: true };
}

// Stable per-instance key for schema-backed tabs that do not pass a label
// (they cannot persist across unmount, but still need a unique registry slot).
let draftValidatorSeq = 0;

/**
 * Push every react-hook-form field of a widget config tab into the whole-widget
 * draft (previewConfig) as it changes. A single coalescing debounce per tab
 * collects the names that changed and, on flush, pushes each one's LATEST value
 * — so two fields changed within the debounce window are both committed (the
 * old shared last-writer-wins debounce silently dropped the first). Dotted field
 * names (e.g. `ctaButton.show`) are read by path. When a zod `schema` is passed
 * the values are coerced (e.g. numeric inputs stored as numbers, not strings)
 * and the tab is validated at save time.
 */
export function useSyncDraftForm<TFieldValues extends Record<string, any>>(
  form: UseFormReturn<TFieldValues>,
  onFieldChanged?: (name: string, value: any) => void,
  options?: { schema?: DraftSchema; label?: string }
) {
  const schema = options?.schema;
  const label = options?.label;
  // Some call sites pass `formSchema.omit(...)` computed inline in the render
  // body, so `schema` gets a new identity on every render. Read it through a
  // ref (updated every render, like onChangedRef below) instead of depending
  // on its identity directly, so those renders don't tear down and rebuild
  // the subscription/debounce below on every keystroke.
  const hasSchema = !!schema;
  const schemaRef = useRef(schema);
  schemaRef.current = schema;

  const onChangedRef = useRef(onFieldChanged);
  onChangedRef.current = onFieldChanged;
  const latestRef = useRef<any>(form.getValues());
  const pendingRef = useRef<Set<string>>(new Set());
  // Whether the user actually edited a field in this tab during its current
  // mount. Only edited tabs freeze a blocking snapshot on unmount (below): a
  // merely-visited tab whose saved config is already invalid must not keep
  // blocking every save for the whole widget after it unmounts.
  const wasEditedRef = useRef(false);

  // Stable registry key for this tab: the label identifies the tab across
  // unmount/remount (so a remount replaces its own snapshot); labelless tabs
  // get a unique per-instance key and simply drop their validator on unmount.
  const validatorKeyRef = useRef<string | undefined>(undefined);
  if (validatorKeyRef.current === undefined) {
    validatorKeyRef.current = label
      ? `label:${label}`
      : `seq:${(draftValidatorSeq += 1)}`;
  }

  const flush = useMemo(
    () =>
      debounce(() => {
        const onChanged = onChangedRef.current;
        if (!onChanged) {
          pendingRef.current.clear();
          return;
        }
        let values = latestRef.current;
        const currentSchema = schemaRef.current;
        if (currentSchema) {
          const parsed = currentSchema.safeParse(values);
          if (parsed.success) values = { ...values, ...parsed.data };
        }
        pendingRef.current.forEach((name) => {
          onChanged(name, get(values, name));
        });
        pendingRef.current.clear();
      }, 300),
    []
  );

  useEffect(() => {
    if (!onFieldChanged) return;

    const subscription = form.watch((values, { name }) => {
      latestRef.current = values;
      if (name) {
        wasEditedRef.current = true;
        pendingRef.current.add(name);
        flush();
      }
    });

    const unregisterFlush = registerFieldFlusher(() => flush.flush());

    const key = validatorKeyRef.current as string;
    const validateValues = (values: any): ReturnType<DraftValidator> => {
      const result = schemaRef.current!.safeParse(values);
      if (result.success) return { ok: true };
      const firstMessage = result.error?.issues?.[0]?.message;
      return { ok: false, label, message: firstMessage || 'ongeldige waarde.' };
    };
    if (schemaRef.current) {
      // Live validator: reads the form at save time so it always reflects the
      // current input while this tab is mounted.
      draftValidators.set(key, () => validateValues(form.getValues()));
    }

    return () => {
      subscription.unsubscribe();
      // Commit (do NOT cancel) any value still inside its debounce window so a
      // field edited just before switching tabs reaches the draft instead of
      // being dropped.
      flush.flush();
      unregisterFlush();
      if (schemaRef.current) {
        if (label && wasEditedRef.current) {
          // Freeze the last form state only for a tab the user actually edited,
          // so it keeps blocking an invalid save after it unmounts; a remount
          // replaces this snapshot. A merely-visited (or never-opened) tab drops
          // its validator instead, so already-invalid saved config no longer
          // blocks saving the rest of the widget.
          const snapshot = form.getValues();
          draftValidators.set(key, () => validateValues(snapshot));
        } else {
          draftValidators.delete(key);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- schema read via schemaRef above
  }, [form, flush, onFieldChanged, hasSchema, label]);
}

// Keys that only exist on the live preview config and must never be persisted
// or counted when deciding whether the draft differs from the saved config.
const PREVIEW_ONLY_KEYS = ['widgetId', 'showAdminHiddenPolygonStyling'];

function stripPreviewOnly<T extends { [key: string]: any }>(
  config: T | undefined,
  extraKeys: string[]
): Partial<T> {
  if (!config || typeof config !== 'object') return {};
  const skip = [...PREVIEW_ONLY_KEYS, ...extraKeys];
  const clone: any = { ...config };
  skip.forEach((key) => delete clone[key]);
  // login/logout urls are injected by the preview and stripped on save too.
  if (clone.login?.url) {
    clone.login = { ...clone.login };
    delete clone.login.url;
  }
  if (clone.logout?.url) {
    clone.logout = { ...clone.logout };
    delete clone.logout.url;
  }
  return clone;
}

// Drop `undefined` values and normalize Dates so the dirty diff matches what the
// server actually stores (JSON.stringify strips `undefined` from the PUT body,
// and lodash.isEqual({k: undefined}, {}) is false — that mismatch would keep the
// bar dirty forever after a successful save).
function normalize(value: any): any {
  try {
    return JSON.parse(JSON.stringify(value ?? {}));
  } catch {
    return value;
  }
}

/**
 * Whole-widget draft engine.
 *
 * `previewConfig` (from useWidgetPreview) already aggregates every tab's edits
 * and lives above the Radix tabs, so it survives tab unmounting. This hook turns
 * that live preview into the widget's working draft:
 *  - dirty  = normalized draft deep-differs from the last-saved widget.config
 *  - save   = one updateConfig(previewConfig) covering all tabs, then reconciles
 *             the draft from the server response so dirty reliably clears
 *  - registers dirty + save with the global SaveController (header save bar)
 *  - wires the unsaved-changes navigation warning
 *  - exposes `onFieldChanged` that writes into the draft by path (supports
 *    dotted names such as `ctaButton.show`)
 *
 * Tabs should seed their react-hook-form defaultValues from `previewConfig`
 * (not the saved config) so switching tabs never discards unsaved edits.
 */
export function useWidgetDraft<T extends { [key: string]: any }>(
  widgetSettings: Partial<{ [key in keyof T]: T[key] }>
) {
  const { data: widget, updateConfig } = useWidgetConfig<T>();
  const { previewConfig, updatePreview } = useWidgetPreview<T>(widgetSettings);
  const { invalidateInFlightSave } = useSaveController();

  const widgetSettingsKeys = useMemo(
    () => Object.keys(widgetSettings),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(Object.keys(widgetSettings))]
  );
  const widgetSettingsRef = useRef(widgetSettings);
  widgetSettingsRef.current = widgetSettings;

  // `_app.tsx` renders `<Component {...pageProps} />` without a `key`, so a
  // widget id change on the same dynamic route (e.g. a browser history jump
  // between two widgets of the same type) does NOT remount this hook. Detect
  // that during render (not in an effect: child tab effects run before this
  // parent effect, so an effect-based clear would wipe the validators the new
  // tabs just registered) and drop every visited-tab validator from the OLD
  // widget so its frozen snapshot can never block saving the new one.
  const routerWidgetId = useRouter().query.id;
  const widgetId = Array.isArray(routerWidgetId)
    ? routerWidgetId[0]
    : routerWidgetId;
  const lastWidgetIdRef = useRef(widgetId);
  if (lastWidgetIdRef.current !== widgetId) {
    clearDraftValidators();
    lastWidgetIdRef.current = widgetId;
  }

  // Also drop everything on unmount (navigating away from the widget entirely).
  useEffect(() => clearDraftValidators, []);

  // A save started for the OLD widget id must not be able to flash
  // success/blocked on the new one once it resolves. `register(null)` only
  // bumps the staleness token on unmount, and switching widget id here does
  // not unmount, so invalidate explicitly on every id change.
  useEffect(() => {
    invalidateInFlightSave();
  }, [widgetId, invalidateInFlightSave]);

  // Always hold the freshest draft so save() reads flushed values, not a stale
  // closure from when it was registered.
  const previewRef = useRef(previewConfig);
  previewRef.current = previewConfig;

  const savedConfig = widget?.config as T | undefined;

  const isDirty = useMemo(() => {
    if (!previewConfig || !savedConfig) return false;
    return !isEqual(
      normalize(stripPreviewOnly(previewConfig, widgetSettingsKeys)),
      normalize(stripPreviewOnly(savedConfig, widgetSettingsKeys))
    );
  }, [previewConfig, savedConfig, widgetSettingsKeys]);

  // Write a field into the draft by path so dotted names nest correctly instead
  // of creating a literal "a.b" key that would be persisted as garbage.
  const onFieldChanged = useCallback(
    (key: string, value: any) => {
      // Functional update so multiple field pushes in the same tick (e.g. the
      // coalescing flush pushing every changed field) compose instead of each
      // one clobbering the previous from a stale snapshot.
      updatePreview((prev) => {
        if (!prev) return prev as any;
        if (typeof key === 'string' && key.includes('.')) {
          const next = cloneDeep(prev) as T;
          set(next as any, key, value);
          return next;
        }
        return { ...prev, [key]: value } as T;
      });
    },
    [updatePreview]
  );

  const save = useCallback(async () => {
    // Commit any value still inside its debounce window before saving.
    flushAllFields();
    // Let React apply the setState triggered by the flush so previewRef is fresh.
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Block the save if a mounted tab has an invalid field.
    const validation = runDraftValidators();
    if (!validation.ok) {
      throw new Error(
        validation.message || 'Controleer de invoer en probeer opnieuw.'
      );
    }

    const draft = stripPreviewOnly(previewRef.current, widgetSettingsKeys);
    // Silent: the header save bar renders the success/error state itself.
    const saved = await updateConfig(draft as any, { silent: true });
    if (!saved) {
      throw new Error(
        'De configuratie kon niet worden opgeslagen. Probeer het opnieuw.'
      );
    }

    // Reconcile from what the server actually stored, so isDirty reliably
    // clears after a save. Functional updater: a field changed WHILE the PUT
    // was in flight (after `draft` was captured above) must survive, or the
    // input still shows the typed value while the bar falsely reports "saved".
    updatePreview((prevPreview) => {
      const base: any = {
        ...(saved.config as any),
        ...widgetSettingsRef.current,
        widgetId: (prevPreview as any)?.widgetId,
        showAdminHiddenPolygonStyling: true,
      };
      if (!prevPreview) return base as T;
      // Compare like-for-like: strip prevPreview the same way `draft` already
      // is, so preview-only bookkeeping (widgetId, showAdminHiddenPolygonStyling)
      // and the preview-injected login/logout url never look like "in-flight
      // edits" just because of that asymmetry — only genuinely changed keys
      // fall through to the override below.
      const strippedPrevPreview = stripPreviewOnly(
        prevPreview,
        widgetSettingsKeys
      );
      Object.keys(strippedPrevPreview).forEach((key) => {
        if (!isEqual((strippedPrevPreview as any)[key], (draft as any)[key])) {
          base[key] = (prevPreview as any)[key];
        }
      });
      return base as T;
    });
  }, [updateConfig, widgetSettingsKeys, updatePreview]);

  useRegisterSave({ isDirty, save });

  return {
    widget,
    previewConfig,
    updatePreview,
    updateConfig,
    onFieldChanged,
    isDirty,
    save,
  };
}
