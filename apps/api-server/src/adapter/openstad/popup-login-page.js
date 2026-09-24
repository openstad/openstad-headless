const toScriptJson = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

function popupLoginPage({ origin, projectId, jwt, fallbackUrl }) {
  const message = toScriptJson({ type: 'openstad-login', projectId, jwt });
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Inloggen</title></head><body>
<script>
if (window.opener) {
  window.opener.postMessage(${message}, ${toScriptJson(origin)});
  window.close();
} else {
  window.location.replace(${toScriptJson(fallbackUrl)});
}
</script>
</body></html>`;
}

module.exports = { popupLoginPage };
