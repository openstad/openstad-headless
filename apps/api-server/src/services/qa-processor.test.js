import { describe, expect, it } from 'vitest';

import qaProcessor from './qa-processor.js';

const { processSubmissionQA } = qaProcessor;

function buildDb(items, submittedData) {
  return {
    Widget: {
      findByPk: async () => ({
        dataValues: { config: { items } },
      }),
    },
    Submission: {
      findByPk: async () => ({
        dataValues: { submittedData },
      }),
    },
  };
}

const instance = { data: { submissionId: 1, widgetId: 1 } };

describe('qa-processor processSubmissionQA', () => {
  it('keeps rich text formatting instead of showing escaped tags', async () => {
    const db = buildDb(
      [{ type: 'text', fieldKey: 'toelichting', title: 'Toelichting' }],
      { toelichting: '<ul><li>Een</li><li>Twee</li></ul>' }
    );

    const result = await processSubmissionQA(instance, db);

    expect(result.htmlContent).toContain('<ul><li>Een</li><li>Twee</li></ul>');
    expect(result.htmlContent).not.toContain('&lt;ul');
  });

  it('does not leak &nbsp; entities and trims the answer', async () => {
    const db = buildDb([{ type: 'text', fieldKey: 'naam', title: 'Naam' }], {
      naam: '&nbsp;hallo&nbsp;',
    });

    const result = await processSubmissionQA(instance, db);
    const answer = result.questionsAndAnswers[0].answer;

    expect(answer).toBe('hallo');
    expect(result.htmlContent).not.toContain('&amp;nbsp;');
  });

  it('strips script tags from answers', async () => {
    const db = buildDb([{ type: 'text', fieldKey: 'veld', title: 'Veld' }], {
      veld: '<script>alert(1)</script>ok',
    });

    const result = await processSubmissionQA(instance, db);

    expect(result.htmlContent).not.toContain('<script');
    expect(result.questionsAndAnswers[0].answer).toContain('ok');
  });

  it('encodes plain text with angle brackets safely', async () => {
    const db = buildDb([{ type: 'text', fieldKey: 'som', title: 'Som' }], {
      som: '1 < 2',
    });

    const result = await processSubmissionQA(instance, db);

    expect(result.questionsAndAnswers[0].answer).toContain('1 &lt; 2');
  });

  it('forces safe rel on links in answers', async () => {
    const db = buildDb([{ type: 'text', fieldKey: 'link', title: 'Link' }], {
      link: '<a href="https://evil.example" target="_blank" rel="opener">klik</a>',
    });

    const result = await processSubmissionQA(instance, db);
    const answer = result.questionsAndAnswers[0].answer;

    expect(answer).toContain('rel="noopener noreferrer"');
    expect(answer).not.toContain('rel="opener"');
  });

  it('demotes h1 headings in answers to h3', async () => {
    const db = buildDb([{ type: 'text', fieldKey: 'kop', title: 'Kop' }], {
      kop: '<h1>Kop</h1>',
    });

    const result = await processSubmissionQA(instance, db);

    expect(result.questionsAndAnswers[0].answer).toContain('<h3>Kop</h3>');
    expect(result.questionsAndAnswers[0].answer).not.toContain('<h1>');
  });
});
