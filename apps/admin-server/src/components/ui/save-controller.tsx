import useUnsavedChanges from '@/hooks/use-unsaved-changes';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import { useRouter } from 'next/router';
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

/**
 * Visual state of the persistent save bar.
 * - neutral: nothing to save, bar is hidden
 * - dirty: there are unsaved changes on the page
 * - saving: a save request is in flight
 * - success: the save succeeded (auto-hides after 4s)
 * - error: the save failed (stays visible until dismissed or retried)
 */
export type SaveState = 'neutral' | 'dirty' | 'saving' | 'success' | 'error';

export type SaveRegistration = {
  /** Whether the registered page currently has unsaved changes. */
  isDirty: boolean;
  /** Persist the changes. Must throw / reject when the save fails. */
  save: () => Promise<void>;
  /**
   * `false` keeps a component off the bar. For a form that is shared between an
   * edit page and a create page, where only the edit page is migrated: the
   * create page keeps its own button, so registering there would add a second,
   * permanently disabled save control next to the working one.
   */
  enabled?: boolean;
  /**
   * Name of the form this registration belongs to, used to say which one failed
   * when a page registers several. Left out on a page with a single form: its
   * own message is already unambiguous.
   */
  label?: string;
};

type SaveControllerValue = {
  state: SaveState;
  errorMessage: string | null;
  isRegistered: boolean;
  isDirty: boolean;
  register: (key: string, registration: SaveRegistration | null) => void;
  triggerSave: () => void;
  dismissError: () => void;
  /**
   * Mark any save currently in flight as stale without touching the
   * registered page's dirty/success/error state. Call this when a page
   * switches to a different underlying record WITHOUT unmounting (e.g. a
   * widget id changing on the same route) — `register(null)` only bumps the
   * token on unmount, so without this a save started for the old record could
   * still resolve and flash "saved"/blocked on the new one.
   */
  invalidateInFlightSave: () => void;
  /**
   * Skip the unsaved-changes prompt for the next route change this page
   * starts itself. A create flow navigates to the new record the moment it
   * exists, and the registration is still reported as dirty at that point:
   * clearing the form's baseline only reaches this provider on a later render,
   * so the guard would ask the user to confirm leaving a page whose work was
   * just saved. The flag is one-shot and clears when the navigation settles.
   */
  allowNextNavigation: () => void;
};

const SaveControllerContext = createContext<SaveControllerValue | null>(null);

const SUCCESS_AUTO_HIDE_MS = 4000;

const GENERIC_ERROR =
  'Er is iets misgegaan bij het opslaan. Probeer het opnieuw.';

/** Names of the forms that failed, capped so the bar stays readable. */
function listLabels(labels: string[]): string {
  const shown = labels.slice(0, 3).map((label) => `"${label}"`);
  const rest = labels.length - shown.length;
  return rest > 0 ? `${shown.join(', ')} en ${rest} andere` : shown.join(', ');
}

function errorMessageOf(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : GENERIC_ERROR;
}

export function SaveControllerProvider({ children }: { children: ReactNode }) {
  // One entry per registered form. A page can hold several: the notification
  // page renders one form per mail type, each saving its own record.
  const registrationsRef = useRef(new Map<string, SaveRegistration>());
  const [isRegistered, setIsRegistered] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'saving' | 'success' | 'error'>(
    'idle'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const registrationToken = useRef(0);
  // Synchronous lock: `phase` only flips to 'saving' on the next render, so a
  // second triggerSave() fired before that commit (e.g. a fast double-click
  // on the error-state retry button) could otherwise start a second
  // save-and-merge pass while the first is still in flight.
  const savingRef = useRef(false);

  const clearSuccessTimer = useCallback(() => {
    if (successTimer.current) {
      clearTimeout(successTimer.current);
      successTimer.current = null;
    }
  }, []);

  const syncAggregates = useCallback(() => {
    const active = Array.from(registrationsRef.current.values()).filter(
      (registration) => registration.enabled !== false
    );
    setIsRegistered(active.length > 0);
    setIsDirty(active.some((registration) => registration.isDirty));
  }, []);

  const resetFeedback = useCallback(() => {
    registrationToken.current += 1;
    setErrorMessage(null);
    clearSuccessTimer();
    setPhase('idle');
  }, [clearSuccessTimer]);

  const register = useCallback(
    (key: string, registration: SaveRegistration | null) => {
      const registrations = registrationsRef.current;
      if (!registration) {
        registrations.delete(key);
        // Feedback is cleared only once the page holds no forms at all. A page
        // with several forms unmounts one of them mid-save (a created record
        // replaces its create form), which must not wipe the confirmation the
        // user just earned. A route change clears it instead, see below.
        if (registrations.size === 0) {
          resetFeedback();
        }
        syncAggregates();
        return;
      }
      registrations.set(key, registration);
      syncAggregates();
      if (registration.isDirty) {
        setPhase((prev) => (prev === 'success' ? 'idle' : prev));
      }
    },
    [resetFeedback, syncAggregates]
  );

  const triggerSave = useCallback(() => {
    if (savingRef.current) return;

    const pending = Array.from(registrationsRef.current.entries()).filter(
      ([, registration]) =>
        registration.isDirty && registration.enabled !== false
    );
    if (pending.length === 0) return;

    const token = registrationToken.current;
    const isStale = () => registrationToken.current !== token;
    const namedForms = registrationsRef.current.size > 1;

    savingRef.current = true;
    clearSuccessTimer();
    setErrorMessage(null);
    setPhase('saving');

    const saveAll = async () => {
      try {
        const failures: { label?: string; message: string }[] = [];

        // Sequential on purpose: several of these endpoints read, merge and write
        // the same record, so parallel requests would let the last one win and
        // silently drop the others.
        for (const [key, snapshot] of pending) {
          if (isStale()) return;
          const registrations = registrationsRef.current;
          // A form can unmount while the batch runs; the snapshot keeps its
          // pending edit saveable. One that is still mounted and already clean
          // was saved by something else, so it is skipped.
          const current = registrations.get(key);
          if (current && !current.isDirty) continue;
          const registration = current ?? snapshot;
          try {
            await registration.save();
          } catch (error: unknown) {
            // Carry on with the other forms: one broken form must not block the
            // changes the user made everywhere else on the page.
            failures.push({
              label: registration.label,
              message: errorMessageOf(error),
            });
          }
        }

        if (isStale()) return;

        if (failures.length === 0) {
          // Dirty state is the registered form's to report, not this callback's.
          // Every consumer clears it after a successful save and re-registers,
          // which lands here through `register`. Forcing it false from here would
          // also hide a field the user typed while the request was in flight:
          // that edit was never sent, so the bar has to keep offering to save it.
          setPhase('success');
          clearSuccessTimer();
          successTimer.current = setTimeout(() => {
            setPhase('idle');
            successTimer.current = null;
          }, SUCCESS_AUTO_HIDE_MS);
          return;
        }

        const savedTheRest =
          pending.length > failures.length
            ? ' De overige wijzigingen zijn wel opgeslagen.'
            : '';
        const labels = failures
          .map((failure) => failure.label)
          .filter((label): label is string => !!label);

        let message: string;
        if (!namedForms || failures.length === 1) {
          const prefix =
            namedForms && failures[0].label ? `${failures[0].label}: ` : '';
          message = `${prefix}${failures[0].message}${savedTheRest}`;
        } else if (labels.length === failures.length) {
          message = `De volgende onderdelen konden niet worden opgeslagen: ${listLabels(
            labels
          )}.${savedTheRest}`;
        } else {
          message = `${failures.length} onderdelen konden niet worden opgeslagen.${savedTheRest}`;
        }

        setErrorMessage(message);
        setPhase('error');
      } finally {
        savingRef.current = false;
      }
    };

    saveAll();
  }, [clearSuccessTimer]);

  const dismissError = useCallback(() => {
    setErrorMessage(null);
    setPhase('idle');
  }, []);

  const invalidateInFlightSave = resetFeedback;

  useEffect(() => clearSuccessTimer, [clearSuccessTimer]);

  // The per-form cleanup above no longer clears feedback on its own, so a page
  // that is left behind would otherwise hand its error or confirmation to the
  // next one.
  const router = useRouter();
  useEffect(() => {
    router.events.on('routeChangeStart', resetFeedback);
    return () => router.events.off('routeChangeStart', resetFeedback);
  }, [router, resetFeedback]);

  const state: SaveState = useMemo(() => {
    if (phase === 'saving') return 'saving';
    if (phase === 'error') return 'error';
    // An edit made while the request was in flight (or right after it
    // resolved) keeps `isDirty` true; that edit was never sent, so it must
    // win over a stale 'success' confirmation instead of being hidden by it.
    if (isRegistered && isDirty) return 'dirty';
    if (phase === 'success') return 'success';
    return 'neutral';
  }, [phase, isRegistered, isDirty]);

  const { setSavedState, getCurrentStateRef } = useUnsavedChanges();
  useEffect(() => {
    setSavedState(false);
  }, [setSavedState]);

  const skipNavigationGuardRef = useRef(false);
  const allowNextNavigation = useCallback(() => {
    skipNavigationGuardRef.current = true;
  }, []);
  getCurrentStateRef.current = () =>
    skipNavigationGuardRef.current ? false : isRegistered && isDirty;

  useEffect(() => {
    const clear = () => {
      skipNavigationGuardRef.current = false;
    };
    router.events.on('routeChangeComplete', clear);
    router.events.on('routeChangeError', clear);
    return () => {
      router.events.off('routeChangeComplete', clear);
      router.events.off('routeChangeError', clear);
    };
  }, [router]);

  const value = useMemo<SaveControllerValue>(
    () => ({
      state,
      errorMessage,
      isRegistered,
      isDirty,
      register,
      triggerSave,
      dismissError,
      invalidateInFlightSave,
      allowNextNavigation,
    }),
    [
      state,
      errorMessage,
      isRegistered,
      isDirty,
      register,
      triggerSave,
      dismissError,
      invalidateInFlightSave,
      allowNextNavigation,
    ]
  );

  return (
    <SaveControllerContext.Provider value={value}>
      {children}
    </SaveControllerContext.Provider>
  );
}

export function useSaveController(): SaveControllerValue {
  const context = useContext(SaveControllerContext);
  if (!context) {
    throw new Error(
      'useSaveController must be used within a SaveControllerProvider'
    );
  }
  return context;
}

/**
 * Register a page's save handler + dirty state with the global save bar.
 * The registration is kept up to date on every render and cleared on unmount
 * so the bar never targets a page that is no longer visible.
 */
export function useRegisterSave(registration: SaveRegistration) {
  const { register } = useSaveController();
  // Identifies this component's own entry, so several forms on one page each
  // keep their own registration and an unmounting one only clears its own.
  const key = useId();
  const enabled = registration.enabled !== false;

  useEffect(() => {
    if (!enabled) return;
    register(key, registration);
  }, [
    register,
    key,
    enabled,
    registration.isDirty,
    registration.save,
    registration.label,
  ]);

  useEffect(() => {
    if (!enabled) return;
    return () => register(key, null);
  }, [register, key, enabled]);
}

/**
 * Re-baseline a form on the values that were just persisted.
 *
 * `sent` must be a deep copy taken *before* the request: `getValues()` hands
 * out the live nested objects, so a keystroke during the request would mutate
 * the snapshot too and the comparison below could never see a difference.
 *
 * Anything typed while the request was in flight was not part of it. Adopting
 * the current values as the saved baseline would mark that edit as saved and
 * silently drop it, so those values are kept as a live, still-dirty edit.
 */
export function rebaselineAfterSave(
  form: {
    getValues: () => any;
    reset: (values?: any, options?: any) => void;
  },
  sent: any
) {
  const editedMeanwhile = !isEqual(form.getValues(), sent);
  form.reset(
    sent,
    editedMeanwhile ? { keepValues: true, keepDirty: true } : undefined
  );
}

/**
 * Register a react-hook-form page with the global save bar.
 *
 * On top of `useRegisterSave` this clears the form's dirty baseline after a
 * successful save, so the bar can switch to its "saved" confirmation instead
 * of keeping the "unsaved changes" warning on screen.
 */
export function useRegisterFormSave(
  form: {
    formState: { isDirty: boolean };
    getValues: () => any;
    reset: (values?: any, options?: any) => void;
  },
  save: () => Promise<void>,
  options?: { enabled?: boolean; label?: string }
) {
  const saveAndClearDirty = useCallback(async () => {
    const sent = cloneDeep(form.getValues());
    await save();
    rebaselineAfterSave(form, sent);
  }, [form, save]);

  useRegisterSave({
    enabled: options?.enabled,
    label: options?.label,
    isDirty: form.formState.isDirty,
    save: saveAndClearDirty,
  });
}
