function getStringValue(value) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function isLikelyRandomText(value) {
  const text = getStringValue(value);
  if (!text || text.length < 12) return false;

  const lettersOnly = text.toLowerCase().replace(/[^a-z]/g, '');
  const originalLettersOnly = text.replace(/[^a-zA-Z]/g, '');
  if (lettersOnly.length < 12) return false;

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
  if (uniqueCharRatio > 0.74) randomSignals += 1;
  if (maxConsecutiveConsonants >= 5) randomSignals += 1;
  if (!hasWhitespace) randomSignals += 1;
  if (uppercaseRatio > 0.25 && uppercaseRatio < 0.95) randomSignals += 1;

  return randomSignals >= 3;
}

function removeSpamMetaFields(payload = {}) {
  const cleaned = { ...payload };
  delete cleaned.__timeToSubmitMs;
  return cleaned;
}

function analyzeSpamPayload(payload = {}, options = {}) {
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
  const scoreBreakdown = {
    randomLikePoints: randomLikeCount * 2,
    compactMixedCasePoints: compactMixedCaseCount,
    ratioPoints: suspiciousRatio >= 0.25 ? 2 : 0,
    veryFastSubmitPoints: veryFastSubmit ? 1 : 0,
  };
  const spamScore = Object.values(scoreBreakdown).reduce((a, b) => a + b, 0);
  const thresholds = {
    minEvidence: 2,
    suspiciousRatio: 0.25,
    spamScore: 4,
  };

  const hasEnoughEvidence = suspiciousCount >= thresholds.minEvidence;
  const passesRatioThreshold = suspiciousRatio >= thresholds.suspiciousRatio;
  const passesScoreThreshold = spamScore >= thresholds.spamScore;

  const isProbablySpam =
    (hasEnoughEvidence && passesRatioThreshold && passesScoreThreshold) ||
    (randomLikeCount >= 1 && veryFastSubmit && textCandidates.length >= 2);

  if (!options.withDetails) {
    return { isProbablySpam };
  }

  return {
    isProbablySpam,
    spamScore,
    scoreBreakdown,
    thresholds,
    randomLikeCount,
    compactMixedCaseCount,
    suspiciousRatio,
    veryFastSubmit,
    timeToSubmitMs: Number.isFinite(timeToSubmitMs) ? timeToSubmitMs : null,
    candidateCount,
  };
}

function logSpamAnalysis({ routeName, req, analysis }) {
  const logFn = analysis?.isProbablySpam ? console.warn : console.info;
  const thresholds = analysis?.thresholds || {};
  const scoreBreakdown = analysis?.scoreBreakdown || {};
  const randomLikeCount = analysis?.randomLikeCount || 0;
  const compactMixedCaseCount = analysis?.compactMixedCaseCount || 0;
  const candidateCount = analysis?.candidateCount || 0;
  const suspiciousRatio = analysis?.suspiciousRatio || 0;
  const timeToSubmitMs = analysis?.timeToSubmitMs;

  const randomLikeThreshold = thresholds.minEvidence || 0;
  const ratioThreshold = thresholds.suspiciousRatio || 0;
  const scoreThreshold = thresholds.spamScore || 0;
  const timeThresholdMs = 2500;

  logFn('[spam-detector] Submission analyzed', {
    routeName,
    projectId: req?.params?.projectId,
    widgetId: req?.body?.widgetId,
    ip: req?.ip,
    isProbablySpam: !!analysis?.isProbablySpam,
    totaleSpamscore: `${analysis?.spamScore || 0}/${scoreThreshold}`,
    scoreSignalen: {
      'Aantal velden met willekeurige tekst': `${randomLikeCount}/${randomLikeThreshold} -> ${scoreBreakdown.randomLikePoints || 0} punten`,
      'Aantal velden met verdacht hoofdletter-/kleineletterpatroon': `${compactMixedCaseCount}/${randomLikeThreshold} -> ${scoreBreakdown.compactMixedCasePoints || 0} punten`,
      'Verdachte verhouding van signalen': `${suspiciousRatio.toFixed(3)}/${ratioThreshold} -> ${scoreBreakdown.ratioPoints || 0} punten`,
      'Tijd tot verzenden (ms)': `${timeToSubmitMs ?? 'n.v.t.'}/${timeThresholdMs} -> ${scoreBreakdown.veryFastSubmitPoints || 0} punten`,
    },
    aantalBeoordeeldeVelden: candidateCount,
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  analyzeSpamPayload,
  isLikelyRandomText,
  logSpamAnalysis,
  removeSpamMetaFields,
};
