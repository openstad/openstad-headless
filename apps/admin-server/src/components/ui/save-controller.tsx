import useUnsavedChanges from '@/hooks/use-unsaved-changes';
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
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
};

type SaveControllerValue = {
  state: SaveState;
  errorMessage: string | null;
  isRegistered: boolean;
  isDirty: boolean;
  register: (registration: SaveRegistration | null) => void;
  triggerSave: () => void;
  dismissError: () => void;
};

const SaveControllerContext = createContext<SaveControllerValue | null>(null);

const SUCCESS_AUTO_HIDE_MS = 4000;

export function SaveControllerProvider({ children }: { children: ReactNode }) {
  const registrationRef = useRef<SaveRegistration | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  // 'idle' means the bar just mirrors the dirty/registered state.
  const [phase, setPhase] = useState<'idle' | 'saving' | 'success' | 'error'>(
    'idle'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Bumped every time a page unmounts. A save captures the token at start and
  // ignores its own settlement if the token changed meanwhile — this prevents a
  // save that resolves after the user navigated away from flashing a stale
  // green/red bar on the next page.
  const registrationToken = useRef(0);

  const clearSuccessTimer = useCallback(() => {
    if (successTimer.current) {
      clearTimeout(successTimer.current);
      successTimer.current = null;
    }
  }, []);

  const register = useCallback(
    (registration: SaveRegistration | null) => {
      registrationRef.current = registration;
      if (!registration) {
        // Unmount / leaving the page: clear everything so the bar never carries
        // a previous page's success or error into the next one.
        registrationToken.current += 1;
        setIsRegistered(false);
        setIsDirty(false);
        setErrorMessage(null);
        clearSuccessTimer();
        setPhase('idle');
        return;
      }
      // Same page re-registering (e.g. its dirty flag changed after a save):
      // keep the current phase so a just-shown success/error is not wiped when
      // isDirty flips to false. Exception: if the user starts editing again
      // during the success window, drop back to the dirty state so the bar does
      // not claim "opgeslagen" while there are unsaved changes.
      setIsRegistered(true);
      setIsDirty(!!registration.isDirty);
      if (registration.isDirty) {
        setPhase((prev) => (prev === 'success' ? 'idle' : prev));
      }
    },
    [clearSuccessTimer]
  );

  const triggerSave = useCallback(() => {
    const registration = registrationRef.current;
    if (!registration) return;

    const token = registrationToken.current;
    const isStale = () => registrationToken.current !== token;

    clearSuccessTimer();
    setErrorMessage(null);
    setPhase('saving');

    registration
      .save()
      .then(() => {
        // Ignore the result if the user navigated away mid-save.
        if (isStale()) return;
        setPhase('success');
        clearSuccessTimer();
        successTimer.current = setTimeout(() => {
          setPhase('idle');
          successTimer.current = null;
        }, SUCCESS_AUTO_HIDE_MS);
      })
      .catch((error: unknown) => {
        if (isStale()) return;
        const message =
          error instanceof Error && error.message
            ? error.message
            : 'Er is iets misgegaan bij het opslaan. Probeer het opnieuw.';
        setErrorMessage(message);
        setPhase('error');
      });
  }, [clearSuccessTimer]);

  const dismissError = useCallback(() => {
    setErrorMessage(null);
    setPhase('idle');
  }, []);

  useEffect(() => clearSuccessTimer, [clearSuccessTimer]);

  const state: SaveState = useMemo(() => {
    if (phase === 'saving') return 'saving';
    if (phase === 'error') return 'error';
    if (phase === 'success') return 'success';
    if (isRegistered && isDirty) return 'dirty';
    return 'neutral';
  }, [phase, isRegistered, isDirty]);

  // Warn on browser close/refresh and in-app navigation whenever ANY
  // registered page has unsaved changes — centralized here (instead of each
  // page wiring its own) so every save-bar consumer (widgets and settings
  // pages alike) gets the warning automatically.
  const { setSavedState, getCurrentStateRef } = useUnsavedChanges();
  useEffect(() => {
    setSavedState(false);
  }, [setSavedState]);
  getCurrentStateRef.current = () => isRegistered && isDirty;

  const value = useMemo<SaveControllerValue>(
    () => ({
      state,
      errorMessage,
      isRegistered,
      isDirty,
      register,
      triggerSave,
      dismissError,
    }),
    [
      state,
      errorMessage,
      isRegistered,
      isDirty,
      register,
      triggerSave,
      dismissError,
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

  useEffect(() => {
    register(registration);
  }, [register, registration.isDirty, registration.save]);

  useEffect(() => {
    return () => register(null);
  }, [register]);
}
