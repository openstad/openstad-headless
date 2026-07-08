import isEqual from 'lodash/isEqual';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook that warns the user when they try to leave the page with unsaved changes.
 * Compares current state against the last saved snapshot to determine if there
 * are unsaved changes. No manual dirty tracking needed.
 *
 * Usage:
 *   const { setSavedState, getCurrentState } = useUnsavedChanges();
 *   setSavedState({ name, markers }); // after loading or saving
 *   getCurrentState.current = () => ({ name, markers }); // keep up to date
 */
export default function useUnsavedChanges(
  message = 'Je hebt niet-opgeslagen wijzigingen. Weet je zeker dat je wilt doorgaan?'
) {
  const savedStateRef = useRef<any>(null);
  const getCurrentStateRef = useRef<(() => any) | null>(null);
  const router = useRouter();

  const setSavedState = useCallback((state: any) => {
    savedStateRef.current = structuredClone(state);
  }, []);

  function isDirty() {
    if (!getCurrentStateRef.current || savedStateRef.current === null)
      return false;
    return !isEqual(getCurrentStateRef.current(), savedStateRef.current);
  }

  // Browser close / refresh
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty()) return;
      e.preventDefault();
      e.returnValue = message;
      return message;
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [message]);

  // Next.js in-app navigation
  useEffect(() => {
    const handler = () => {
      if (!isDirty()) return;
      if (!window.confirm(message)) {
        router.events.emit('routeChangeError');
        throw 'Route change aborted by user (unsaved changes)';
      }
    };
    router.events.on('routeChangeStart', handler);
    return () => router.events.off('routeChangeStart', handler);
  }, [router, message]);

  return { setSavedState, getCurrentStateRef };
}
