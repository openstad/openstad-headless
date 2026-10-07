import { useRef, useState } from 'react';

import { getKnownIdentities } from '../../../lib/auth-broker';
import {
  exchangeKnownIdentities,
  outcomeFromCodeResult,
  outcomeFromFieldsResult,
  popupLoginUrl,
  waitForPopupLogin,
} from '../login-flow';

const POPUP_NAME = 'osc-login';
// A popup that closes this fast was most likely blocked, not cancelled
const BLOCKED_WITHIN_MS = 1500;

export default function useLoginFlow(props) {
  const self = this;
  const [dialog, setDialog] = useState(null);
  const pending = useRef(null);

  const close = () => {
    const current = pending.current;
    pending.current = null;
    setDialog(null);
    return current;
  };

  const openPopup = (url) =>
    window.open(url, POPUP_NAME, 'width=480,height=640');

  const readOwnJwt = () =>
    getKnownIdentities({ apiUrl: self.api.apiUrl }).find(
      (identity) => identity.projectId === String(self.projectId)
    )?.jwt || null;

  const navigate = (current) => {
    if (current.onBeforeRedirect) current.onBeforeRedirect();
    document.location.href = current.resolvedLoginUrl;
  };

  const redirect = async () => {
    const current = pending.current;
    if (!current) return;
    setDialog(null);
    current.resolvedLoginUrl =
      typeof current.loginUrl === 'function'
        ? await current.loginUrl()
        : current.loginUrl;

    if (!props.multiProjectLogin) {
      close();
      navigate(current);
      return;
    }

    const popupUrl = popupLoginUrl(current.resolvedLoginUrl);
    let popup = current.popup;
    if (popup) popup.location.href = popupUrl;
    else popup = openPopup(popupUrl);

    const openedAt = Date.now();
    const jwt = popup
      ? await waitForPopupLogin({
          popup,
          apiOrigin: new URL(self.api.apiUrl).origin,
          projectId: self.projectId,
          readJwt: readOwnJwt,
        })
      : null;
    if (jwt) {
      handle({ type: 'loggedIn', jwt });
      return;
    }
    // Blocked, or closed too fast to be a deliberate cancel: let the user
    // choose a same-window login instead of redirecting unasked
    if (!popup || Date.now() - openedAt < BLOCKED_WITHIN_MS) {
      setDialog({ step: 'blocked', busy: false });
      return;
    }
    close();
    current.resolve(false);
  };

  const failAndRedirect = (err) => {
    console.error('[osc-auth] inline login failed, using the login page', err);
    redirect();
  };

  const handle = (outcome) => {
    if (outcome.type === 'loggedIn') {
      self.applyJwt(outcome.jwt);
      const current = close();
      if (current) current.resolve(true);
      return;
    }
    if (outcome.type === 'fields') {
      pending.current.pendingJwt = outcome.pendingJwt;
      setDialog({
        step: 'fields',
        missingFields: outcome.missingFields,
        labels: outcome.labels,
        privacy: outcome.privacy,
        busy: false,
      });
      return;
    }
    if (outcome.type === 'uniquecode') {
      setDialog({ step: 'uniquecode', busy: false });
      return;
    }
    if (outcome.type === 'error') {
      setDialog((current) => ({
        ...current,
        error: outcome.error,
        invalidFields: outcome.invalidFields,
        busy: false,
      }));
      return;
    }
    redirect();
  };

  const requireLogin = ({ loginUrl, onBeforeRedirect }) =>
    new Promise((resolve) => {
      pending.current = {
        resolve,
        loginUrl,
        onBeforeRedirect,
        pendingJwt: null,
      };

      if (!props.multiProjectLogin) {
        redirect();
        return;
      }

      const identities = getKnownIdentities({
        apiUrl: self.api.apiUrl,
        excludeProjectId: self.projectId,
      });
      if (identities.length === 0) {
        // Open within the click, before any await, so popup blockers allow it
        pending.current.popup = openPopup('about:blank');
        redirect();
        return;
      }
      exchangeKnownIdentities({
        api: self.api,
        projectId: self.projectId,
        identities,
      })
        .then(handle)
        .catch(failAndRedirect);
    });

  const onSubmitCode = (code) => {
    setDialog((current) => ({ ...current, busy: true, error: undefined }));
    self.api.user
      .loginWithUniqueCode({ projectId: self.projectId, code })
      .then((result) => handle(outcomeFromCodeResult(result)))
      .catch(failAndRedirect);
  };

  const onSubmitFields = (fields) => {
    setDialog((current) => ({ ...current, busy: true, error: undefined }));
    self.api.user
      .completeFields({
        projectId: self.projectId,
        pendingJwt: pending.current.pendingJwt,
        fields,
      })
      .then((result) => handle(outcomeFromFieldsResult(result)))
      .catch(failAndRedirect);
  };

  const onRedirect = () => {
    const current = close();
    if (current) navigate(current);
  };

  const onOpenChange = (open) => {
    if (open) return;
    const current = close();
    if (current) current.resolve(false);
  };

  return {
    requireLogin,
    dialogProps: {
      open: !!dialog,
      step: 'uniquecode',
      ...(dialog || {}),
      onOpenChange,
      onSubmitCode,
      onSubmitFields,
      onRedirect,
    },
  };
}
