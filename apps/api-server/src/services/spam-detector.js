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
  // Only evaluate non-trivial text fields. Very short values generate noise
  // (e.g. names or short answers) and are not useful for this detector.
  const textCandidates = Object.entries(payload)
    .filter(([, value]) => typeof value === 'string')
    .map(([, value]) => getStringValue(value))
    .filter((value) => {
      if (!value) return false;
      if (value.length < 12) return false;
      return true;
    });

  // Primary signal: fields that statistically look like generated/gibberish text.
  const randomLikeCount = textCandidates.filter(isLikelyRandomText).length;

  // Secondary signal: long, compact strings with unusual mixed casing.
  // These often show up in automated spam payloads and random token-like input.
  const compactMixedCaseCount = textCandidates.filter((value) => {
    const lettersOnly = value.replace(/[^a-zA-Z]/g, '');
    if (lettersOnly.length < 14) return false;
    if (/\s/.test(value)) return false;
    const uppercaseCount = (lettersOnly.match(/[A-Z]/g) || []).length;
    const uppercaseRatio = uppercaseCount / lettersOnly.length;
    return uppercaseRatio > 0.2 && uppercaseRatio < 0.95;
  }).length;

  // Metadata signal: submissions sent very quickly after form load are more likely bot traffic.
  // __timeToSubmitMs is injected upstream and removed before persistence.
  const timeToSubmitMs = Number(payload.__timeToSubmitMs);
  const veryFastSubmit =
    Number.isFinite(timeToSubmitMs) && timeToSubmitMs > 0 && timeToSubmitMs < 2500;

  const candidateCount = textCandidates.length;
  const suspiciousCount = Math.max(randomLikeCount, compactMixedCaseCount);

  // Ratio keeps scoring fair across large and small forms.
  // A single suspicious field in a very large form should weigh less heavily.
  const suspiciousRatio =
    candidateCount > 0 ? suspiciousCount / candidateCount : 0;

  // Scoring model:
  // - random-like text is weighted strongest
  // - mixed-case compact text is a weaker indicator
  // - high suspicious ratio and very fast submit add context points
  const scoreBreakdown = {
    randomLikePoints: randomLikeCount * 2,
    compactMixedCasePoints: compactMixedCaseCount,
    ratioPoints: suspiciousRatio >= 0.25 ? 2 : 0,
    veryFastSubmitPoints: veryFastSubmit ? 1 : 0,
  };
  const spamScore = Object.values(scoreBreakdown).reduce((a, b) => a + b, 0);

  // Tuned thresholds for high-confidence spam classification.
  const thresholds = {
    minEvidence: 2,
    suspiciousRatio: 0.25,
    spamScore: 4,
  };

  const hasEnoughEvidence = suspiciousCount >= thresholds.minEvidence;
  const passesRatioThreshold = suspiciousRatio >= thresholds.suspiciousRatio;
  const passesScoreThreshold = spamScore >= thresholds.spamScore;

  // Decision rule:
  // 1) Main path requires enough evidence + ratio + score.
  // 2) Fallback catches obvious "fast bot" behavior in shorter forms.
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
    totalSpamScore: `${analysis?.spamScore || 0}/${scoreThreshold}`,
    scoreSignals: {
      'Fields with random-like text': `${randomLikeCount}/${randomLikeThreshold} -> ${scoreBreakdown.randomLikePoints || 0} points`,
      'Fields with suspicious upper/lowercase pattern': `${compactMixedCaseCount}/${randomLikeThreshold} -> ${scoreBreakdown.compactMixedCasePoints || 0} points`,
      'Suspicious signal ratio': `${suspiciousRatio.toFixed(3)}/${ratioThreshold} -> ${scoreBreakdown.ratioPoints || 0} points`,
      'Time to submit (ms)': `${timeToSubmitMs ?? 'n/a'}/${timeThresholdMs} -> ${scoreBreakdown.veryFastSubmitPoints || 0} points`,
    },
    evaluatedFieldCount: candidateCount,
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  analyzeSpamPayload,
  isLikelyRandomText,
  logSpamAnalysis,
  removeSpamMetaFields,
};
