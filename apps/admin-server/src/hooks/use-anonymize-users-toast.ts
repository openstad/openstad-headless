import toast from 'react-hot-toast';

export function getAnonymizeUsersToastMessage(error: unknown): string {
  const message = error instanceof Error ? error.message?.trim() : undefined;
  if (message?.includes('project-has-ended parameter')) {
    return 'Het project moet eerst zijn beëindigd voordat gebruikers geanonimiseerd kunnen worden.';
  }
  if (message?.includes('You cannot anonymizeAllUsers this Project')) {
    return 'Je hebt geen rechten om gebruikers van dit project te anonimiseren.';
  }
  return message || 'Er is helaas iets mis gegaan.';
}

export function useAnonymizeUsersToastMessage() {
  return (error: unknown) => {
    toast.error(getAnonymizeUsersToastMessage(error));
  };
}
