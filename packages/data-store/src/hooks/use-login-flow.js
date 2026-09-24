import { useRef, useState } from 'react';

import { getKnownIdentities } from '../../../lib/auth-broker';
import {
  exchangeKnownIdentities,
  outcomeFromCodeResult,
  outcomeFromFieldsResult,
} from '../login-flow';

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

  const redirect = () => {
    const current = close();
    if (!current) return;
    if (current.onBeforeRedirect) current.onBeforeRedirect();
    document.location.href = current.loginUrl;
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
    },
  };
}
