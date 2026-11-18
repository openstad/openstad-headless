export const sentimentLabels: Record<string, string> = {
  for: 'Voor',
  'no sentiment': 'Neutraal',
  against: 'Tegen',
};

export function getSentimentLabel(sentiment?: string): string {
  if (!sentiment) return '';
  return sentimentLabels[sentiment] ?? sentiment;
}
