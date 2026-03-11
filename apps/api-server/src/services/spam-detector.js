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

function isCompactMixedCaseText(value) {
  const text = getStringValue(value);
  const lettersOnly = text.replace(/[^a-zA-Z]/g, '');
  if (lettersOnly.length < 14) return false;
  if (/\s/.test(text)) return false;

  const uppercaseCount = (lettersOnly.match(/[A-Z]/g) || []).length;
  const uppercaseRatio = uppercaseCount / lettersOnly.length;
  return uppercaseRatio > 0.2 && uppercaseRatio < 0.95;
}

function isSuspiciousEmailPattern(value) {
  const text = getStringValue(value).toLowerCase();
  if (!text || !text.includes('@')) return false;

  const [localPart, domain] = text.split('@');
  if (!localPart || !domain) return false;
  if (localPart.length < 12) return false;

  const segments = localPart.split('.');
  if (segments.length < 5) return false;

  const averageSegmentLength =
    segments.reduce((total, segment) => total + segment.length, 0) /
    segments.length;
  const singleCharSegments = segments.filter((segment) => segment.length === 1);
  const containsDigit = /\d/.test(localPart);

  return (
    averageSegmentLength <= 3 &&
    (containsDigit || singleCharSegments.length >= 2)
  );
}

function isLikelySingleTokenGarbage(value) {
  const text = getStringValue(value);
  if (!text || /\s/.test(text)) return false;
  if (!/^[a-zA-Z]+$/.test(text)) return false;

  const lettersOnly = text.toLowerCase();
  if (lettersOnly.length < 14) return false;

  const uppercaseCount = (text.match(/[A-Z]/g) || []).length;
  const uppercaseRatio = uppercaseCount / text.length;
  const uniqueCharRatio = new Set(lettersOnly).size / lettersOnly.length;
  const vowelCount = (lettersOnly.match(/[aeiouy]/g) || []).length;
  const vowelRatio = vowelCount / lettersOnly.length;

  const bigrams = new Set();
  for (let i = 0; i < lettersOnly.length - 1; i += 1) {
    bigrams.add(lettersOnly.slice(i, i + 2));
  }
  const bigramRatio = bigrams.size / Math.max(1, lettersOnly.length - 1);

  return (
    uppercaseRatio >= 0.12 &&
    uppercaseRatio <= 0.3 &&
    uniqueCharRatio >= 0.65 &&
    vowelRatio >= 0.3 &&
    vowelRatio <= 0.65 &&
    bigramRatio >= 0.95
  );
}

function isDigitHeavyGarbage(value) {
  const text = getStringValue(value);
  if (!text || text.length < 12) return false;

  const compact = text.replace(/\s/g, '');
  const alnumChars = compact.match(/[a-zA-Z0-9]/g) || [];
  if (alnumChars.length < 12) return false;

  const digitCount = (compact.match(/\d/g) || []).length;
  const letterCount = (compact.match(/[a-zA-Z]/g) || []).length;
  const digitRatio = digitCount / alnumChars.length;
  const hasMixedAlphaNumeric = digitCount >= 4 && letterCount >= 3;
  const uniqueCharRatio =
    new Set(compact.toLowerCase().replace(/[^a-z0-9]/g, '')).size /
    alnumChars.length;

  return (
    hasMixedAlphaNumeric &&
    digitRatio >= 0.45 &&
    uniqueCharRatio >= 0.35 &&
    !text.includes('@')
  );
}

function isSpacedGarbageFragment(value) {
  const text = getStringValue(value);
  if (!text || text.length < 16) return false;
  if (!/\s/.test(text)) return false;

  const tokens = text.split(/\s+/).filter(Boolean);
  if (tokens.length < 3) return false;

  const suspiciousTokenCount = tokens.filter((token) => {
    if (token.length < 2) return false;
    const alnumChars = token.match(/[a-zA-Z0-9]/g) || [];
    if (alnumChars.length < 2) return false;
    const digitCount = (token.match(/\d/g) || []).length;
    const letterCount = (token.match(/[a-zA-Z]/g) || []).length;
    const digitRatio = digitCount / alnumChars.length;
    return digitCount >= 1 && letterCount >= 1 && digitRatio >= 0.3;
  }).length;

  return suspiciousTokenCount >= 2;
}

function removeSpamMetaFields(payload = {}) {
  const cleaned = { ...payload };
  delete cleaned.__timeToSubmitMs;
  return cleaned;
}

function shouldIgnoreSpamCheckField(key) {
  return key === 'embeddedUrl' || key === 'ipAddress';
}

function analyzeSpamPayload(payload = {}, options = {}) {
  // Only evaluate non-trivial text fields. Very short values generate noise
  // (e.g. names or short answers) and are not useful for this detector.
  const textCandidates = Object.entries(payload)
    .filter(([key]) => !shouldIgnoreSpamCheckField(key))
    .filter(([, value]) => typeof value === 'string')
    .map(([, value]) => getStringValue(value))
    .filter((value) => {
      if (!value) return false;
      if (value.length < 12) return false;
      return true;
    });

  const fieldSignals = textCandidates.map((value) => ({
    value,
    isRandomLike: isLikelyRandomText(value),
    isCompactMixedCase: isCompactMixedCaseText(value),
    isSuspiciousEmail: isSuspiciousEmailPattern(value),
    isSingleTokenGarbage: isLikelySingleTokenGarbage(value),
    isDigitHeavyGarbage: isDigitHeavyGarbage(value),
    isSpacedGarbageFragment: isSpacedGarbageFragment(value),
  }));

  // Primary signal: fields that statistically look like generated/gibberish text.
  const randomLikeCount = fieldSignals.filter(
    (field) => field.isRandomLike
  ).length;

  // Secondary signal: long, compact strings with unusual mixed casing.
  // These often show up in automated spam payloads and random token-like input.
  const compactMixedCaseCount = fieldSignals.filter(
    (field) => field.isCompactMixedCase
  ).length;

  const suspiciousEmailCount = fieldSignals.filter(
    (field) => field.isSuspiciousEmail
  ).length;

  const singleTokenGarbageCount = fieldSignals.filter(
    (field) => field.isSingleTokenGarbage
  ).length;

  const digitHeavyGarbageCount = fieldSignals.filter(
    (field) => field.isDigitHeavyGarbage
  ).length;

  const spacedGarbageFragmentCount = fieldSignals.filter(
    (field) => field.isSpacedGarbageFragment
  ).length;

  // Evidence and ratio are based on unique suspicious fields so overlapping
  // signals don't double count, while distinct suspicious fields still add up.
  const suspiciousFieldCount = fieldSignals.filter(
    (field) =>
      field.isRandomLike ||
      field.isCompactMixedCase ||
      field.isSuspiciousEmail ||
      field.isSingleTokenGarbage ||
      field.isDigitHeavyGarbage ||
      field.isSpacedGarbageFragment
  ).length;

  // Metadata signal: submissions sent very quickly after form load are more likely bot traffic.
  // __timeToSubmitMs is injected upstream and removed before persistence.
  const timeToSubmitMs = Number(payload.__timeToSubmitMs);
  const veryFastSubmit =
    Number.isFinite(timeToSubmitMs) &&
    timeToSubmitMs > 0 &&
    timeToSubmitMs < 2500;

  const candidateCount = textCandidates.length;

  // Ratio keeps scoring fair across large and small forms.
  // A single suspicious field in a very large form should weigh less heavily.
  const suspiciousRatio =
    candidateCount > 0 ? suspiciousFieldCount / candidateCount : 0;

  // Scoring model:
  // - random-like text is weighted strongest
  // - mixed-case compact text is a weaker indicator
  // - high suspicious ratio and very fast submit add context points
  const scoreBreakdown = {
    randomLikePoints: randomLikeCount * 2,
    compactMixedCasePoints: compactMixedCaseCount,
    suspiciousEmailPoints: suspiciousEmailCount,
    singleTokenGarbagePoints: singleTokenGarbageCount,
    digitHeavyGarbagePoints: digitHeavyGarbageCount,
    spacedGarbageFragmentPoints: spacedGarbageFragmentCount,
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

  const hasEnoughEvidence = suspiciousFieldCount >= thresholds.minEvidence;
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
    suspiciousEmailCount,
    singleTokenGarbageCount,
    digitHeavyGarbageCount,
    spacedGarbageFragmentCount,
    suspiciousFieldCount,
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
  const suspiciousEmailCount = analysis?.suspiciousEmailCount || 0;
  const singleTokenGarbageCount = analysis?.singleTokenGarbageCount || 0;
  const digitHeavyGarbageCount = analysis?.digitHeavyGarbageCount || 0;
  const spacedGarbageFragmentCount = analysis?.spacedGarbageFragmentCount || 0;
  const suspiciousFieldCount = analysis?.suspiciousFieldCount || 0;
  const candidateCount = analysis?.candidateCount || 0;
  const suspiciousRatio = analysis?.suspiciousRatio || 0;
  const timeToSubmitMs = analysis?.timeToSubmitMs;

  const evidenceThreshold = thresholds.minEvidence || 0;
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
      'Fields with random-like text': `${randomLikeCount} -> ${
        scoreBreakdown.randomLikePoints || 0
      } points`,
      'Fields with suspicious upper/lowercase pattern': `${compactMixedCaseCount} -> ${
        scoreBreakdown.compactMixedCasePoints || 0
      } points`,
      'Fields with suspicious email pattern': `${suspiciousEmailCount} -> ${
        scoreBreakdown.suspiciousEmailPoints || 0
      } points`,
      'Fields with single-token garbage pattern': `${singleTokenGarbageCount} -> ${
        scoreBreakdown.singleTokenGarbagePoints || 0
      } points`,
      'Fields with digit-heavy garbage pattern': `${digitHeavyGarbageCount} -> ${
        scoreBreakdown.digitHeavyGarbagePoints || 0
      } points`,
      'Fields with spaced garbage fragments': `${spacedGarbageFragmentCount} -> ${
        scoreBreakdown.spacedGarbageFragmentPoints || 0
      } points`,
      'Unique suspicious fields': `${suspiciousFieldCount}/${evidenceThreshold}`,
      'Suspicious signal ratio': `${suspiciousRatio.toFixed(
        3
      )}/${ratioThreshold} -> ${scoreBreakdown.ratioPoints || 0} points`,
      'Time to submit (ms)': `${
        timeToSubmitMs ?? 'n/a'
      }/${timeThresholdMs} -> ${
        scoreBreakdown.veryFastSubmitPoints || 0
      } points`,
    },
    evaluatedFieldCount: candidateCount,
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  analyzeSpamPayload,
  isCompactMixedCaseText,
  isLikelyRandomText,
  isLikelySingleTokenGarbage,
  isDigitHeavyGarbage,
  isSpacedGarbageFragment,
  isSuspiciousEmailPattern,
  logSpamAnalysis,
  removeSpamMetaFields,
};
