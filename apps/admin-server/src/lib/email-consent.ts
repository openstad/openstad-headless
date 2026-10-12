export const isEmailNotificationConsentRequired = (config: any): boolean =>
  !!config?.auth?.provider?.openstad?.requiredUserFields?.includes(
    'emailNotificationConsent'
  );
