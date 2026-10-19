import { describe, expect, it } from 'vitest';

import {
  toSpreadsheetValue,
  voteLinksToClipboardText,
  voteLinksToCsv,
} from './vote-links';

const rows = [
  {
    id: 1,
    title: 'Jeugdfestival',
    link: 'https://openstad.org/stemmen?openstadResourceId=1',
  },
  {
    id: 2,
    title: 'Bankjes; meer "groen"',
    link: 'https://openstad.org/stemmen?openstadResourceId=2',
    note: 'Status staat stemmen niet toe',
  },
];

describe('voteLinksToCsv', () => {
  it('builds a semicolon CSV with a header row', () => {
    expect(voteLinksToCsv(rows)).toBe(
      [
        'ID;Titel;Stemlink;Opmerking',
        '1;Jeugdfestival;https://openstad.org/stemmen?openstadResourceId=1;',
        '2;"Bankjes; meer ""groen""";https://openstad.org/stemmen?openstadResourceId=2;Status staat stemmen niet toe',
      ].join('\r\n')
    );
  });
});

describe('voteLinksToClipboardText', () => {
  it('puts the title and link in two columns', () => {
    expect(voteLinksToClipboardText(rows.slice(0, 1))).toBe(
      'Titel\tStemlink\nJeugdfestival\thttps://openstad.org/stemmen?openstadResourceId=1'
    );
  });
});

describe('toSpreadsheetValue', () => {
  it('keeps a title from running as a formula', () => {
    expect(toSpreadsheetValue('=HYPERLINK("x")')).toBe(`'=HYPERLINK("x")`);
    expect(toSpreadsheetValue('+31 6')).toBe(`'+31 6`);
    expect(toSpreadsheetValue('-plan')).toBe(`'-plan`);
    expect(toSpreadsheetValue('@user')).toBe(`'@user`);
  });

  it('removes tabs and line breaks', () => {
    expect(toSpreadsheetValue('Plan\tmet\r\nregels')).toBe('Plan met regels');
  });
});
