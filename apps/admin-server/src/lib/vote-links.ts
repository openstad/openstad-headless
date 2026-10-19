export type VoteLinkRow = {
  id: number;
  title: string;
  link: string;
  note?: string;
};

// Titles are user input: keep them from running as spreadsheet formulas.
export function toSpreadsheetValue(value: unknown): string {
  const text = String(value ?? '')
    .replace(/[\t\r\n]+/g, ' ')
    .trim();
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function toCsvField(value: unknown, delimiter: string): string {
  const text = toSpreadsheetValue(value);
  return text.includes(delimiter) || text.includes('"')
    ? `"${text.replace(/"/g, '""')}"`
    : text;
}

export function voteLinksToCsv(rows: VoteLinkRow[], delimiter = ';'): string {
  const lines = [
    ['ID', 'Titel', 'Stemlink', 'Opmerking'],
    ...rows.map((row) => [row.id, row.title, row.link, row.note || '']),
  ];
  return lines
    .map((line) => line.map((v) => toCsvField(v, delimiter)).join(delimiter))
    .join('\r\n');
}

export function voteLinksToClipboardText(rows: VoteLinkRow[]): string {
  return [
    'Titel\tStemlink',
    ...rows.map(
      (row) =>
        `${toSpreadsheetValue(row.title)}\t${toSpreadsheetValue(row.link)}`
    ),
  ].join('\n');
}
