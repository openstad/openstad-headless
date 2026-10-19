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
  it('maakt een CSV met puntkomma en een kopregel', () => {
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
  it('zet titel en link in twee kolommen', () => {
    expect(voteLinksToClipboardText(rows.slice(0, 1))).toBe(
      'Titel\tStemlink\nJeugdfestival\thttps://openstad.org/stemmen?openstadResourceId=1'
    );
  });
});

describe('toSpreadsheetValue', () => {
  it('voorkomt dat een titel als formule wordt uitgevoerd', () => {
    expect(toSpreadsheetValue('=HYPERLINK("x")')).toBe(`'=HYPERLINK("x")`);
    expect(toSpreadsheetValue('+31 6')).toBe(`'+31 6`);
    expect(toSpreadsheetValue('-plan')).toBe(`'-plan`);
    expect(toSpreadsheetValue('@user')).toBe(`'@user`);
  });

  it('haalt tabs en regeleinden weg', () => {
    expect(toSpreadsheetValue('Plan\tmet\r\nregels')).toBe('Plan met regels');
  });
});
