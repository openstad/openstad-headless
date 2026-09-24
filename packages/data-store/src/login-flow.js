const fieldsOutcome = (data) => ({
  type: 'fields',
  pendingJwt: data.pendingJwt,
  missingFields: data.missingFields,
  labels: data.labels || {},
  privacy: data.privacy || null,
});

export function outcomeFromGateResult(result) {
  if (result.status === 200) return { type: 'loggedIn', jwt: result.data.jwt };
  if (result.status === 409 && result.data.status === 'fields_required') {
    return fieldsOutcome(result.data);
  }
  if (result.status === 409 && result.data.status === 'uniquecode_required') {
    return { type: 'uniquecode' };
  }
  return { type: 'redirect' };
}

export async function exchangeKnownIdentities({ api, projectId, identities }) {
  for (const identity of identities) {
    const result = await api.user.exchangeLogin({
      projectId,
      sourceJwt: identity.jwt,
    });
    if (result.status === 401 || result.status === 403) continue;
    return outcomeFromGateResult(result);
  }
  return { type: 'redirect' };
}

export function outcomeFromCodeResult(result) {
  if (result.status === 400) return { type: 'error', error: 'code_required' };
  if (result.status === 401) return { type: 'error', error: 'invalid_code' };
  if (result.status === 429) {
    return { type: 'error', error: 'too_many_attempts' };
  }
  return outcomeFromGateResult(result);
}

export function outcomeFromFieldsResult(result) {
  if (result.status === 422) {
    return { type: 'error', error: 'invalid_access_code' };
  }
  return outcomeFromGateResult(result);
}

export function popupLoginUrl(url) {
  const popupUrl = new URL(url);
  popupUrl.searchParams.set('popup', '1');
  return popupUrl.toString();
}

export function waitForPopupLogin({
  popup,
  apiOrigin,
  projectId,
  win = window,
}) {
  return new Promise((resolve) => {
    const finish = (jwt) => {
      win.removeEventListener('message', onMessage);
      win.clearInterval(timer);
      resolve(jwt);
    };
    const onMessage = (event) => {
      const data = event.data || {};
      if (event.source !== popup || event.origin !== apiOrigin) return;
      if (data.type !== 'openstad-login') return;
      if (String(data.projectId) !== String(projectId)) return;
      if (typeof data.jwt !== 'string') return;
      finish(data.jwt);
    };
    const timer = win.setInterval(() => {
      if (popup.closed) finish(null);
    }, 500);
    win.addEventListener('message', onMessage);
  });
}
