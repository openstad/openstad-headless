import { describe, expect, it } from 'vitest';

import spamDetector from './spam-detector.js';

const {
  isLikelyRandomText,
  analyzeSpamPayload,
  removeSpamMetaFields,
  isSpamFilterEnabled,
} = spamDetector;

function restoreSpamFilterEnv(prev) {
  if (typeof prev === 'undefined') {
    delete process.env.SPAM_FILTER_ENABLED;
    return;
  }
  process.env.SPAM_FILTER_ENABLED = prev;
}

describe('spam-detector', () => {
  it('analyzeSpamPayload returns minimal shape by default', () => {
    const payload = {
      field1: 'TzqVDdSFJVpgHYymZvrD',
      field2: 'MelgkXhrEYcgMVqpUhpQXTJl',
    };

    const analysis = analyzeSpamPayload(payload);
    expect(analysis).toEqual({ isProbablySpam: true });
  });

  it('removeSpamMetaFields removes all time-to-submit variants, also nested', () => {
    const payload = {
      __timeToSubmitMs: 1000,
      timetosubmit: 1200,
      extraData: {
        timeToSubmitMs: 1300,
        nested: {
          timetosubmit: 1400,
          value: 'keep-me',
        },
      },
      list: [{ timetosubmit: 1500, value: 'keep-me-too' }],
    };

    const cleaned = removeSpamMetaFields(payload);
    expect(cleaned).toEqual({
      extraData: {
        nested: {
          value: 'keep-me',
        },
      },
      list: [{ value: 'keep-me-too' }],
    });
  });

  it('isSpamFilterEnabled is false by default', () => {
    const prev = process.env.SPAM_FILTER_ENABLED;
    delete process.env.SPAM_FILTER_ENABLED;
    expect(isSpamFilterEnabled()).toBe(false);
    restoreSpamFilterEnv(prev);
  });

  it('isSpamFilterEnabled is true only when env is "true"', () => {
    const prev = process.env.SPAM_FILTER_ENABLED;
    process.env.SPAM_FILTER_ENABLED = 'true';
    expect(isSpamFilterEnabled()).toBe(true);
    process.env.SPAM_FILTER_ENABLED = 'false';
    expect(isSpamFilterEnabled()).toBe(false);
    restoreSpamFilterEnv(prev);
  });

  it('isLikelyRandomText flags gibberish-like text', () => {
    const samples = ['TzqVDdSFJVpgHYymZvrD', 'MelgkXhrEYcgMVqpUhpQXTJl'];

    samples.forEach((sample) => {
      expect(isLikelyRandomText(sample)).toBe(true);
    });
  });

  it('isLikelyRandomText flags mixed-case borderline gibberish as random', () => {
    const sample = 'GjXyuhLtwacOSOPQoiYEinmM';
    expect(isLikelyRandomText(sample)).toBe(true);
  });

  it('isLikelyRandomText keeps normal text as non-random', () => {
    const samples = [
      'Ik wil graag weten hoe de procedure werkt voor mijn aanvraag.',
      'Mijn naam is Jan de Vries en ik heb een vraag over de openingstijden.',
      'De straatverlichting in onze wijk doet het al drie dagen niet.',
      'DIT IS EEN KLACHT OVER DE STRAATVERLICHTING IN ONZE BUURT',
      'IK BEN HEEL BOOS!!! DIT DUURT AL 3 WEKEN!!!',
      'Jean-Baptiste van der Oosterbruggen-Smits de la Torre',
      'McCloud-van’t Hoff III (Ongelooflijk Lang)',
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    ];

    samples.forEach((sample) => {
      expect(isLikelyRandomText(sample)).toBe(false);
    });
  });

  it('analyzeSpamPayload keeps weird-but-real payloads as non-spam', () => {
    const payload = {
      naam: 'Jean-Baptiste van der Oosterbruggen-Smits de la Torre',
      bericht: 'IK BEN HEEL BOOS!!! DIT DUURT AL 3 WEKEN!!!',
    };

    const analysis = analyzeSpamPayload(payload, { withDetails: true });
    expect(analysis.isProbablySpam).toBe(false);
  });

  it('analyzeSpamPayload does not flag payload with one suspicious token and one normal message', () => {
    const payload = {
      naam: 'QuRqoMTcKPiDGkHt',
      bericht: 'Mijn lantaarnpaal werkt niet meer sinds zaterdagavond.',
    };

    const analysis = analyzeSpamPayload(payload, { withDetails: true });
    expect(analysis.isProbablySpam).toBe(false);
  });

  it('analyzeSpamPayload marks probable spam for low-quality bot-like payloads', () => {
    const payload = {
      field1: 'TzqVDdSFJVpgHYymZvrD',
      field2: 'MelgkXhrEYcgMVqpUhpQXTJl',
      __timeToSubmitMs: 900,
    };

    const analysis = analyzeSpamPayload(payload, { withDetails: true });
    expect(analysis.isProbablySpam).toBe(true);
    expect(analysis.randomLikeCount).toBeGreaterThanOrEqual(2);
  });

  it('analyzeSpamPayload does not mark normal payloads as spam', () => {
    const payload = {
      vraag:
        'Ik wil graag een melding doen over het groenonderhoud in mijn buurt.',
      toelichting:
        'Het gras is al weken niet gemaaid en dat zorgt voor overlast.',
      __timeToSubmitMs: 4300,
    };

    const analysis = analyzeSpamPayload(payload, { withDetails: true });
    expect(analysis.isProbablySpam).toBe(false);
  });

  it('analyzeSpamPayload does not flag long forms when suspicious fields are a small minority', () => {
    const payload = {
      f1: 'Ik wil graag melden dat de stoep bij ons huis kapot is.',
      f2: 'De verlichting doet het vaak niet in de avond.',
      f3: 'Wij hebben hier al meerdere keren contact over gehad.',
      f4: 'Graag een terugkoppeling over de planning van herstel.',
      f5: 'Ook de afwatering werkt niet goed na regen.',
      f6: 'Dit zorgt voor onveilige situaties bij oversteekplaatsen.',
      f7: 'Onze straat heeft al langer last van dit probleem.',
      f8: 'Ik hoor graag wat de vervolgstappen zijn.',
      f9: 'QuRqoMTcKPiDGkHt',
      f10: 'MelgkXhrEYcgMVqpUhpQXTJl',
    };

    const analysis = analyzeSpamPayload(payload, { withDetails: true });
    expect(analysis.isProbablySpam).toBe(false);
    expect(analysis.suspiciousRatio).toBeLessThan(0.35);
  });

  it('analyzeSpamPayload flags when suspicious ratio is high enough', () => {
    const payload = {
      f1: 'TzqVDdSFJVpgHYymZvrD',
      f2: 'MelgkXhrEYcgMVqpUhpQXTJl',
      f3: 'EnFOeBskzaqEwEjpowV',
      f4: 'aPuLcxsbiAUPPwUJBgUzhrN',
      f5: 'GjJzywOfQkTmOrKBp',
      f6: 'GorHiyRRgyCKjtGJjZlOIBX',
      f7: 'Ik wil graag een reactie op mijn eerdere melding.',
      f8: 'De straatverlichting is nog steeds niet opgelost.',
      f9: 'Dank voor het in behandeling nemen van dit bericht.',
      f10: 'Met vriendelijke groet',
    };

    const analysis = analyzeSpamPayload(payload, { withDetails: true });
    expect(analysis.isProbablySpam).toBe(true);
    expect(analysis.suspiciousRatio).toBeGreaterThanOrEqual(0.35);
  });

  it('analyzeSpamPayload flags reported post-update spam sample', () => {
    const payload = {
      Naam: 'HLwxKhMUtfydBaoReWhpWK',
      Bericht: 'cqagnJINkVBJzeKL',
      Emailadres: 'sydney.lambert@translink.ca',
      embeddedUrl: 'https://openstad.org/contact',
      telefoonnummer: '7701166855',
    };

    const analysis = analyzeSpamPayload(payload, { withDetails: true });
    expect(analysis.isProbablySpam).toBe(true);
  });
});
