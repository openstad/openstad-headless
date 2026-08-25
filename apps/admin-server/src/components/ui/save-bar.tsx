import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle2, X, XCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { Button } from './button';
import { useSaveController } from './save-controller';

/**
 * Persistent save bar rendered in the page header. Reads its state from the
 * SaveController and renders one of: nothing (neutral), a grey "unsaved
 * changes" bar with a save button (dirty/saving), a green confirmation
 * (success, auto-hides after 4s) or a red error that persists until dismissed
 * or retried. All copy is Dutch to match the admin UI.
 */
export function SaveBar() {
  const {
    state,
    errorMessage,
    isRegistered,
    isDirty,
    triggerSave,
    dismissError,
  } = useSaveController();

  const retryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (state === 'error') {
      retryRef.current?.focus();
    }
  }, [state]);

  if (state === 'success') {
    return (
      <div
        role="status"
        className={cn(
          'flex items-center gap-2 rounded-md border px-4 py-2 text-sm',
          'border-green-200 bg-green-50 text-green-800'
        )}>
        <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>Je wijzigingen zijn opgeslagen</span>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div
        role="alert"
        className={cn(
          'flex items-center gap-2 rounded-md border px-4 py-2 text-sm',
          'border-red-200 bg-red-50 text-red-800'
        )}>
        <XCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          {errorMessage ||
            'Er is iets misgegaan bij het opslaan. Probeer het opnieuw.'}
        </span>
        <Button
          ref={retryRef}
          size="sm"
          variant="default"
          onClick={triggerSave}
          className="ml-2">
          Opnieuw proberen
        </Button>
        <button
          type="button"
          onClick={dismissError}
          aria-label="Melding sluiten"
          className="ml-1 rounded p-1 text-red-800 hover:bg-red-100">
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  if (!isRegistered) return null;

  const isSaving = state === 'saving';
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-md border px-4 py-2 text-sm',
        'border-border bg-muted text-foreground'
      )}>
      {isDirty && (
        <>
          <AlertTriangle
            className="h-4 w-4 shrink-0 text-amber-500"
            aria-hidden="true"
          />
          <span>Je hebt wijzigingen aangebracht op deze pagina.</span>
        </>
      )}
      <Button
        size="sm"
        onClick={triggerSave}
        loading={isSaving}
        disabled={isSaving || !isDirty}>
        Wijzigingen opslaan
      </Button>
    </div>
  );
}
