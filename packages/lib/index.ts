export { LocalStorage } from './local-storage';
export {
  getKnownIdentities,
  hasActiveSessionCookie,
  notifyAuthChange,
  onAuthChange,
} from './auth-broker';
export type { KnownIdentity } from './auth-broker';
export { loadWidget } from './load-widget';
export { hasRole } from './has-role';
export { canLikeResource } from './can-like';
export {
  detectEnvironment,
  mapQuestionType,
  pushFormStart,
  pushFormStep,
  pushFormSubmit,
  pushQuestionInteract,
  pushFormError,
} from './gtm-datalayer';
