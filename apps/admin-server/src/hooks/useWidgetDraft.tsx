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

type DraftSchema = {
  safeParse: (value: any) => {
    success: boolean;
    data?: any;
    error?: { issues?: Array<{ message?: string }> };
  };
};

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
  options?: { schema?: DraftSchema; label?: string; id?: string }
) {
  const schema = options?.schema;
  const label = options?.label;
  const id = options?.id;
  const hasSchema = !!schema;
  const schemaRef = useRef(schema);
  schemaRef.current = schema;

  const onChangedRef = useRef(onFieldChanged);
  onChangedRef.current = onFieldChanged;
  const latestRef = useRef<any>(form.getValues());
  const pendingRef = useRef<Set<string>>(new Set());
  const wasEditedRef = useRef(false);

  // The key must be unique BETWEEN tabs and STABLE ACROSS A REMOUNT of the
  // same tab, so a call-site `id` (identical on every remount) wins over the
  // tab's display `label` (which can collide between tabs), which in turn
  // wins over a per-mount `seq` counter (only safe when nothing else is
  // stored under this validator across a remount).
  const validatorKeyRef = useRef<string | undefined>(undefined);
  if (validatorKeyRef.current === undefined) {
    validatorKeyRef.current = id
      ? `id:${id}`
      : label
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

    const key = validatorKeyRef.current as string;
    const validateValues = (values: any): ReturnType<DraftValidator> => {
      const result = schemaRef.current!.safeParse(values);
      if (result.success) return { ok: true };
      const firstMessage = result.error?.issues?.[0]?.message;
      return { ok: false, label, message: firstMessage || 'ongeldige waarde.' };
    };
    const installLiveValidator = () => {
      draftValidators.set(key, () =>
        wasEditedRef.current ? validateValues(form.getValues()) : { ok: true }
      );
    };

    // A prior mount of this same tab may have left a strict snapshot
    // validator behind (unmounted while invalid). Keep it in place across
    // this remount instead of clobbering it with a fresh, permissive one —
    // otherwise switching tabs and back would silently un-block an invalid
    // save. It only gets replaced once the user actually edits again below.
    const hadInheritedEntry = draftValidators.has(key);

    const subscription = form.watch((values, { name }) => {
      latestRef.current = values;
      if (name) {
        if (!wasEditedRef.current && schemaRef.current) {
          installLiveValidator();
        }
        wasEditedRef.current = true;
        pendingRef.current.add(name);
        flush();
      }
    });

    const unregisterFlush = registerFieldFlusher(() => flush.flush());

    if (schemaRef.current && !hadInheritedEntry) {
      // Only validate a tab the user actually touched. Stored config that
      // predates a schema change would otherwise block the whole widget save
      // from every tab, just because this one was mounted once.
      installLiveValidator();
    }

    return () => {
      subscription.unsubscribe();
      flush.flush();
      unregisterFlush();
      if (schemaRef.current) {
        if (label && wasEditedRef.current) {
          const snapshot = form.getValues();
          draftValidators.set(key, () => validateValues(snapshot));
        } else if (!hadInheritedEntry) {
          // We own this entry (nothing was inherited from a prior mount) and
          // the user never edited it this time round — safe to drop.
          draftValidators.delete(key);
        }
        // else: an inherited strict snapshot was never touched this mount —
        // leave it exactly as it was.
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- schema read via schemaRef above
  }, [form, flush, onFieldChanged, hasSchema, label]);
}

const PREVIEW_ONLY_KEYS = ['widgetId', 'showAdminHiddenPolygonStyling'];

function stripPreviewOnly<T extends { [key: string]: any }>(
  config: T | undefined,
  extraKeys: string[]
): Partial<T> {
  if (!config || typeof config !== 'object') return {};
  const skip = [...PREVIEW_ONLY_KEYS, ...extraKeys];
  const clone: any = { ...config };
  skip.forEach((key) => delete clone[key]);
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

  const routerWidgetId = useRouter().query.id;
  const widgetId = Array.isArray(routerWidgetId)
    ? routerWidgetId[0]
    : routerWidgetId;
  const lastWidgetIdRef = useRef(widgetId);
  if (lastWidgetIdRef.current !== widgetId) {
    clearDraftValidators();
    lastWidgetIdRef.current = widgetId;
  }

  useEffect(() => clearDraftValidators, []);

  useEffect(() => {
    invalidateInFlightSave();
  }, [widgetId, invalidateInFlightSave]);

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

  const onFieldChanged = useCallback(
    (key: string, value: any) => {
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
    flushAllFields();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const validation = runDraftValidators();
    if (!validation.ok) {
      throw new Error(
        validation.message || 'Controleer de invoer en probeer opnieuw.'
      );
    }

    const draft = stripPreviewOnly(previewRef.current, widgetSettingsKeys);
    const saved = await updateConfig(draft as any, { silent: true });
    if (!saved) {
      throw new Error(
        'De configuratie kon niet worden opgeslagen. Probeer het opnieuw.'
      );
    }

    updatePreview((prevPreview) => {
      const base: any = {
        ...(saved.config as any),
        ...widgetSettingsRef.current,
        widgetId: (prevPreview as any)?.widgetId,
        showAdminHiddenPolygonStyling: true,
      };
      if (!prevPreview) return base as T;
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
