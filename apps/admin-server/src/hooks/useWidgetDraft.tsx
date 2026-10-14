import {
  useRegisterSave,
  useSaveController,
} from '@/components/ui/save-controller';
import { isDraftSyncPaused } from '@/lib/draft-sync-pause';
import { isPlainObject, looseEqual } from '@/lib/loose-equal';
import cloneDeep from 'lodash/cloneDeep';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import set from 'lodash/set';
import unset from 'lodash/unset';
import { useRouter } from 'next/router';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
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
const draftValidators = new Map<
  string,
  { owner: number; validate: DraftValidator }
>();
let draftOwner = 0;
let draftOwnerSeq = 0;

function clearDraftValidators() {
  draftValidators.clear();
}

function runDraftValidators(): { ok: boolean; message?: string } {
  for (const { owner, validate } of Array.from(draftValidators.values())) {
    if (owner !== draftOwner) continue;
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

export type ShownDefault = {
  shown: unknown;
  stored: unknown;
};
const shownDefaults = new Map<string, ShownDefault>();
const userChangedPaths = new Set<string>();
let shownDefaultsGeneration = 0;
let currentDraftState: { draft: any; saved: any } = { draft: {}, saved: {} };

function clearShownDefaults() {
  shownDefaults.clear();
  userChangedPaths.clear();
  pendingRepairs.clear();
  shownDefaultsGeneration += 1;
}

export type FieldRepair = { from: unknown; to: unknown };
const pendingRepairs = new Map<string, FieldRepair>();

/** The repair for a stored value that a field corrected by itself, if any. */
export function collectRepair(
  path: string,
  value: unknown,
  draft: any,
  saved: any
): FieldRepair | undefined {
  const stored = get(saved, path);
  if (stored === undefined || stored === null) return undefined;
  if (!looseEqual(get(draft, path), stored)) return undefined;
  if (looseEqual(value, stored)) return undefined;
  return { from: cloneDeep(stored), to: cloneDeep(value) };
}

function recordRepair(path: string, value: unknown) {
  const { draft, saved } = currentDraftState;
  const repair = collectRepair(path, value, draft, saved);
  if (repair) pendingRepairs.set(path, repair);
}

/** The draft with every pending field repair the user did not change. */
export function withRepairs(
  draft: any,
  repairs: Map<string, FieldRepair> = pendingRepairs
): any {
  if (!repairs.size) return draft;
  const out = cloneDeep(draft ?? {});
  repairs.forEach(({ from, to }, path) => {
    if (looseEqual(get(out, path), from)) set(out, path, cloneDeep(to));
  });
  return out;
}

/** The defaults a tab shows for keys the widget never saved. */
export function collectShownDefaults(
  defaults: Record<string, unknown>,
  prefix: string | undefined,
  draft: any,
  saved: any,
  known: Map<string, ShownDefault>
): Array<[string, ShownDefault]> {
  const found: Array<[string, ShownDefault]> = [];
  const visit = (path: string, shown: unknown) => {
    const stored = get(saved, path);
    if (
      !known.has(path) &&
      (stored === undefined || stored === null) &&
      looseEqual(get(draft, path), stored)
    ) {
      found.push([path, { shown: cloneDeep(shown), stored }]);
    }
    if (isPlainObject(shown)) {
      Object.keys(shown).forEach((key) => visit(`${path}.${key}`, shown[key]));
    }
  };
  Object.keys(defaults).forEach((key) =>
    visit(prefix ? `${prefix}.${key}` : key, defaults[key])
  );
  return found;
}

function recordShownDefaults(
  values: Record<string, unknown>,
  prefix: string | undefined
) {
  const { draft, saved } = currentDraftState;
  collectShownDefaults(values, prefix, draft, saved, shownDefaults).forEach(
    ([path, entry]) => shownDefaults.set(path, entry)
  );
}

/** Keeps a number a number when the field default is a number. */
export function asDefaultType(value: unknown, shown: unknown): unknown {
  if (
    typeof shown === 'number' &&
    typeof value === 'string' &&
    value.trim() !== '' &&
    !Number.isNaN(Number(value))
  ) {
    return Number(value);
  }
  return value;
}

/** The value a field change puts in the draft, keeping the saved type of an emptied number. */
export function draftFieldValue(
  value: unknown,
  shown: unknown,
  stored: unknown
): unknown {
  return asDefaultType(value, shown === '' || shown == null ? stored : shown);
}

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
  options?: {
    schema?: DraftSchema;
    label?: string;
    id?: string;
    prefix?: string;
  }
) {
  const schema = options?.schema;
  const label = options?.label;
  const id = options?.id;
  const hasSchema = !!schema;
  const schemaRef = useRef(schema);
  schemaRef.current = schema;

  const onChangedRef = useRef(onFieldChanged);
  onChangedRef.current = onFieldChanged;
  const formRef = useRef(form);
  formRef.current = form;
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

  const prefix =
    options?.prefix ??
    (onFieldChanged as { draftPrefix?: string } | undefined)?.draftPrefix;
  const prefixRef = useRef(prefix);
  prefixRef.current = prefix;
  const generation = shownDefaultsGeneration;
  useEffect(() => {
    const values = form.getValues() as Record<string, unknown>;
    recordShownDefaults(values, prefix);
    const defaults = (form.formState.defaultValues ?? {}) as Record<
      string,
      unknown
    >;
    Object.keys(values).forEach((key) => {
      if (!looseEqual(values[key], defaults[key])) {
        recordRepair(prefix ? `${prefix}.${key}` : key, values[key]);
      }
    });
  }, [form, prefix, generation]);

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
          const value = get(values, name);
          onChanged(
            name,
            currentSchema
              ? value
              : asDefaultType(
                  value,
                  get(formRef.current.formState.defaultValues, name)
                )
          );
        });
        pendingRef.current.clear();
      }, 300),
    []
  );

  useEffect(() => {
    if (!onFieldChanged) return;

    const key = validatorKeyRef.current as string;
    const owner = draftOwner;
    const validateValues = (values: any): ReturnType<DraftValidator> => {
      const result = schemaRef.current!.safeParse(values);
      if (result.success) return { ok: true };
      const firstMessage = result.error?.issues?.[0]?.message;
      return { ok: false, label, message: firstMessage || 'ongeldige waarde.' };
    };
    const installLiveValidator = () => {
      draftValidators.set(key, {
        owner,
        validate: () =>
          wasEditedRef.current
            ? validateValues(form.getValues())
            : { ok: true },
      });
    };

    // A prior mount of this same tab may have left a strict snapshot
    // validator behind (unmounted while invalid). Keep it in place across
    // this remount instead of clobbering it with a fresh, permissive one —
    // otherwise switching tabs and back would silently un-block an invalid
    // save. It only gets replaced once the user actually edits again below.
    const hadInheritedEntry = draftValidators.get(key)?.owner === owner;

    const subscription = form.watch((values, { name, type }) => {
      latestRef.current = values;
      if (!name) return;
      if (isDraftSyncPaused()) {
        const value = get(values, name);
        recordShownDefaults({ [name]: value }, prefixRef.current);
        recordRepair(
          prefixRef.current ? `${prefixRef.current}.${name}` : name,
          value
        );
        return;
      }
      if (type === 'change') {
        userChangedPaths.add(
          prefixRef.current ? `${prefixRef.current}.${name}` : name
        );
      }
      if (!wasEditedRef.current && schemaRef.current) {
        installLiveValidator();
      }
      wasEditedRef.current = true;
      pendingRef.current.add(name);
      flush();
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
          draftValidators.set(key, {
            owner,
            validate: () => validateValues(snapshot),
          });
        } else if (
          !hadInheritedEntry &&
          draftValidators.get(key)?.owner === owner
        ) {
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

/** The config with each unsaved key set to the default its tab showed. */
export function withShownDefaults(
  config: any,
  shownByKey: Map<string, ShownDefault> = shownDefaults,
  changedByUser: Set<string> = userChangedPaths
): any {
  const out = cloneDeep(config ?? {});
  shownByKey.forEach(({ shown, stored }, path) => {
    if (typeof shown === 'boolean' && changedByUser.has(path)) return;
    const value = get(out, path);
    const unchanged = value === stored || (value == null && stored == null);
    const emptiedAgain =
      shown == null &&
      (value === '' ||
        value === false ||
        (Array.isArray(value) && value.length === 0));
    if (!unchanged && !emptiedAgain) return;
    set(out, path, cloneDeep(shown));
    changedByUser.forEach((changed) => {
      if (
        changed.startsWith(`${path}.`) &&
        typeof shownByKey.get(changed)?.shown === 'boolean'
      ) {
        unset(out, changed);
      }
    });
  });
  return out;
}

/** The top-level keys the user changed, as the PUT body. */
export function changesToSave(
  draft: any,
  saved: any,
  shownByKey: Map<string, ShownDefault> = shownDefaults,
  changedByUser: Set<string> = userChangedPaths
): any {
  const asShown = withShownDefaults(saved, shownByKey, changedByUser);
  const draftAsShown = withShownDefaults(draft, shownByKey, changedByUser);
  const out: any = {};
  Object.keys(draft ?? {}).forEach((key) => {
    if (looseEqual(draftAsShown[key], asShown[key])) return;
    const value = draft[key];
    if (value === undefined) {
      out[key] = null;
      return;
    }
    out[key] =
      typeof saved?.[key] === 'number' &&
      typeof value === 'string' &&
      value.trim() !== '' &&
      !Number.isNaN(Number(value))
        ? Number(value)
        : value;
  });
  return out;
}

/** The draft moved onto a newer saved config; the user's edits win. */
export function rebaseDraft(
  draft: any,
  base: any,
  next: any,
  keepKeys: string[] = []
): any {
  const out: any = { ...(draft ?? {}) };
  const keys = new Set([
    ...Object.keys(draft ?? {}),
    ...Object.keys(base ?? {}),
    ...Object.keys(next ?? {}),
  ]);
  keys.forEach((key) => {
    if (keepKeys.includes(key)) return;
    const value = rebaseValue(draft?.[key], base?.[key], next?.[key]);
    if (value === undefined) delete out[key];
    else out[key] = value;
  });
  return out;
}

function rebaseValue(draft: unknown, base: unknown, next: unknown): unknown {
  if (looseEqual(draft, base)) return cloneDeep(next);
  if (
    isPlainObject(draft) &&
    isPlainObject(next) &&
    (base == null || isPlainObject(base))
  ) {
    return rebaseDraft(draft, base ?? {}, next);
  }
  return draft;
}

/** A tab form submit must not save behind the save bar. */
export async function ignoreTabSubmit(): Promise<void> {}

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
  const draftStateClearedRef = useRef(false);
  const ownerRef = useRef(0);
  if (!ownerRef.current) ownerRef.current = draftOwnerSeq += 1;
  useLayoutEffect(() => {
    draftOwner = ownerRef.current;
  }, []);
  if (!draftStateClearedRef.current || lastWidgetIdRef.current !== widgetId) {
    draftStateClearedRef.current = true;
    clearDraftValidators();
    clearShownDefaults();
    lastWidgetIdRef.current = widgetId;
  }

  useEffect(
    () => () => {
      clearDraftValidators();
      clearShownDefaults();
    },
    []
  );

  useEffect(() => {
    invalidateInFlightSave();
  }, [widgetId, invalidateInFlightSave]);

  const previewRef = useRef(previewConfig);
  previewRef.current = previewConfig;

  const savedConfig = widget?.config as T | undefined;
  currentDraftState = { draft: previewConfig ?? {}, saved: savedConfig ?? {} };
  const savedConfigRef = useRef(savedConfig);
  savedConfigRef.current = savedConfig;

  const draftBaseRef = useRef<{ widgetId?: string; config?: any }>({});
  const inFlightKeysRef = useRef<string[]>([]);
  const hasDraft = !!previewConfig;
  useEffect(() => {
    if (!savedConfig || !hasDraft) return;
    const base = draftBaseRef.current;
    if (base.widgetId !== widgetId || !base.config) {
      draftBaseRef.current = { widgetId, config: cloneDeep(savedConfig) };
      return;
    }
    if (isEqual(base.config, savedConfig)) return;
    draftBaseRef.current = { widgetId, config: cloneDeep(savedConfig) };
    const keepKeys = [
      ...PREVIEW_ONLY_KEYS,
      ...widgetSettingsKeys,
      ...inFlightKeysRef.current,
    ];
    updatePreview(
      (prev) =>
        (prev
          ? rebaseDraft(prev, base.config, savedConfig, keepKeys)
          : prev) as T
    );
  }, [savedConfig, hasDraft, widgetId, widgetSettingsKeys, updatePreview]);

  const isDirty = useMemo(() => {
    if (!previewConfig || !savedConfig) return false;
    const draft = normalize(
      stripPreviewOnly(previewConfig, widgetSettingsKeys)
    );
    const saved = normalize(stripPreviewOnly(savedConfig, widgetSettingsKeys));
    return !looseEqual(withShownDefaults(draft), withShownDefaults(saved));
  }, [previewConfig, savedConfig, widgetSettingsKeys]);

  const onFieldChanged = useCallback(
    (key: string, raw: any) => {
      updatePreview((prev) => {
        if (!prev) return prev as any;
        const value = draftFieldValue(
          raw,
          get(prev, key),
          get(savedConfigRef.current, key)
        );
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
    const payload = changesToSave(
      withRepairs(draft),
      stripPreviewOnly(savedConfigRef.current, widgetSettingsKeys)
    );
    inFlightKeysRef.current = Object.keys(payload);
    let saved: Awaited<ReturnType<typeof updateConfig>>;
    try {
      saved = await updateConfig(payload as any, { silent: true });
    } finally {
      inFlightKeysRef.current = [];
    }
    if (!saved) {
      throw new Error(
        'De configuratie kon niet worden opgeslagen. Probeer het opnieuw.'
      );
    }

    pendingRepairs.clear();
    draftBaseRef.current = {
      ...draftBaseRef.current,
      config: cloneDeep(saved.config),
    };
    updatePreview((prevPreview) => {
      const base: any = {
        ...cloneDeep(saved.config as any),
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
