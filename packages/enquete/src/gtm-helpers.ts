/**
 * Helpers for the GTM dataLayer tracking of the enquete widget.
 */

export const EXPLANATION_SUFFIX = '::explanation';

type QuestionItem = {
  fieldKey?: string;
  questionType?: string;
};

/**
 * Builds a positional question_id map: fieldKey -> "qid{N}" (1-based),
 * counted over real questions only. Pagination and info blocks ('none')
 * do not count, so qid1 = question 1, qid6 = question 6 (per tag plan).
 *
 * Note: the numbering is positional and therefore shifts when questions are
 * reordered in the admin.
 */
export function buildQuestionIdMap(
  items?: Array<QuestionItem>
): Record<string, string> {
  const map: Record<string, string> = {};
  if (!Array.isArray(items)) return map;

  let n = 0;
  for (const item of items) {
    if (
      !item?.fieldKey ||
      item.questionType === 'pagination' ||
      item.questionType === 'none'
    ) {
      continue;
    }
    n += 1;
    map[item.fieldKey] = `qid${n}`;
  }
  return map;
}

/**
 * Splits a raw interaction key into the base fieldKey and whether it concerns an
 * explanation field. Explanations are provided as
 * `${fieldKey}::explanation`.
 */
export function parseInteractionKey(rawKey: string): {
  baseKey: string;
  isExplanation: boolean;
} {
  if (rawKey.endsWith(EXPLANATION_SUFFIX)) {
    return {
      baseKey: rawKey.slice(0, -EXPLANATION_SUFFIX.length),
      isExplanation: true,
    };
  }
  return { baseKey: rawKey, isExplanation: false };
}

/**
 * Determines the question_id for a (raw) interaction key based on the
 * positional map. Explanation fields get the suffix 'explanation'
 * (e.g. "qid1explanation"). Returns null if the base question is unknown.
 */
export function resolveQuestionId(
  questionIdMap: Record<string, string>,
  rawKey: string
): { baseKey: string; questionId: string | null; isExplanation: boolean } {
  const { baseKey, isExplanation } = parseInteractionKey(rawKey);
  const base = questionIdMap[baseKey];
  if (!base) {
    return { baseKey, questionId: null, isExplanation };
  }
  return {
    baseKey,
    questionId: isExplanation ? `${base}explanation` : base,
    isExplanation,
  };
}
