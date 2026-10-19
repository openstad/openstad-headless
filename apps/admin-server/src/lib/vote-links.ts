export type VoteLinkRow = {
  id: number;
  title: string;
  link: string;
  note?: string;
};

// Resource titles are typed by citizens. A value starting with =, +, - or @
// is run as a formula when the export is opened in Excel, so prefix those
// with a quote. Tabs and line breaks would split the cell.
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

// Semicolon-separated, which Dutch Excel opens without an import wizard.
export function voteLinksToCsv(rows: VoteLinkRow[], delimiter = ';'): string {
  const lines = [
    ['ID', 'Titel', 'Stemlink', 'Opmerking'],
    ...rows.map((row) => [row.id, row.title, row.link, row.note || '']),
  ];
  return lines
    .map((line) => line.map((v) => toCsvField(v, delimiter)).join(delimiter))
    .join('\r\n');
}

// Tab-separated, so pasting it in Excel or Google Sheets fills two columns.
export function voteLinksToClipboardText(rows: VoteLinkRow[]): string {
  return [
    'Titel\tStemlink',
    ...rows.map(
      (row) =>
        `${toSpreadsheetValue(row.title)}\t${toSpreadsheetValue(row.link)}`
    ),
  ].join('\n');
}
