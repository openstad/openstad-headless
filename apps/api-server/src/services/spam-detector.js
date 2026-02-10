function getStringValue(value) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function isLikelyRandomText(value) {
  const text = getStringValue(value);
  if (!text || text.length < 14) return false;

  const lettersOnly = text.toLowerCase().replace(/[^a-z]/g, '');
  const originalLettersOnly = text.replace(/[^a-zA-Z]/g, '');
  if (lettersOnly.length < 14) return false;

  const vowelCount = (lettersOnly.match(/[aeiouy]/g) || []).length;
  const vowelRatio = vowelCount / lettersOnly.length;
  const uniqueCharRatio = new Set(lettersOnly).size / lettersOnly.length;
  const hasWhitespace = /\s/.test(text);
  const uppercaseCount = (originalLettersOnly.match(/[A-Z]/g) || []).length;
  const uppercaseRatio = originalLettersOnly.length
    ? uppercaseCount / originalLettersOnly.length
    : 0;

  let maxConsecutiveConsonants = 0;
  let currentConsecutiveConsonants = 0;
  for (const ch of lettersOnly) {
    if (/[aeiouy]/.test(ch)) {
      currentConsecutiveConsonants = 0;
    } else {
      currentConsecutiveConsonants += 1;
      if (currentConsecutiveConsonants > maxConsecutiveConsonants) {
        maxConsecutiveConsonants = currentConsecutiveConsonants;
      }
    }
  }

  let randomSignals = 0;
  if (vowelRatio < 0.22 || vowelRatio > 0.68) randomSignals += 1;
  if (uniqueCharRatio > 0.78) randomSignals += 1;
  if (maxConsecutiveConsonants >= 5) randomSignals += 1;
  if (!hasWhitespace) randomSignals += 1;
  if (uppercaseRatio > 0.35 && uppercaseRatio < 0.95) randomSignals += 1;

  return randomSignals >= 3;
}

function removeSpamMetaFields(payload = {}) {
  const cleaned = { ...payload };
  delete cleaned.__timeToSubmitMs;
  return cleaned;
}

function analyzeSpamPayload(payload = {}) {
  const textCandidates = Object.entries(payload)
    .filter(([, value]) => typeof value === 'string')
    .map(([, value]) => getStringValue(value))
    .filter((value) => {
      if (!value) return false;
      if (value.length < 12) return false;
      return true;
    });
  const randomLikeCount = textCandidates.filter(isLikelyRandomText).length;
  const compactMixedCaseCount = textCandidates.filter((value) => {
    const lettersOnly = value.replace(/[^a-zA-Z]/g, '');
    if (lettersOnly.length < 14) return false;
    if (/\s/.test(value)) return false;
    const uppercaseCount = (lettersOnly.match(/[A-Z]/g) || []).length;
    const uppercaseRatio = uppercaseCount / lettersOnly.length;
    return uppercaseRatio > 0.2 && uppercaseRatio < 0.95;
  }).length;
  const timeToSubmitMs = Number(payload.__timeToSubmitMs);
  const veryFastSubmit =
    Number.isFinite(timeToSubmitMs) && timeToSubmitMs > 0 && timeToSubmitMs < 2500;
  const candidateCount = textCandidates.length;
  const suspiciousCount = Math.max(randomLikeCount, compactMixedCaseCount);
  const suspiciousRatio =
    candidateCount > 0 ? suspiciousCount / candidateCount : 0;

  const hasEnoughEvidence = suspiciousCount >= 2;
  const passesRatioThreshold = suspiciousRatio >= 0.35;

  const isProbablySpam =
    (hasEnoughEvidence && passesRatioThreshold) ||
    (randomLikeCount >= 1 && veryFastSubmit && textCandidates.length >= 2);

  return {
    isProbablySpam,
    randomLikeCount,
    compactMixedCaseCount,
    suspiciousRatio,
    veryFastSubmit,
    candidateCount,
  };
}

function logProbablySpam({ routeName, req, analysis }) {
  console.warn('[spam-detector] Ignored probable spam request', {
    routeName,
    projectId: req?.params?.projectId,
    widgetId: req?.body?.widgetId,
    ip: req?.ip,
    randomLikeCount: analysis?.randomLikeCount || 0,
    veryFastSubmit: !!analysis?.veryFastSubmit,
    candidateCount: analysis?.candidateCount || 0,
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  analyzeSpamPayload,
  isLikelyRandomText,
  logProbablySpam,
  removeSpamMetaFields,
};
