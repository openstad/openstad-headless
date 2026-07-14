import { formatDocumentLabel } from '../../src/utils';

describe('formatDocumentLabel', () => {
  it('humanizes underscores and derives the type from the URL', () => {
    expect(
      formatDocumentLabel(
        'Groenontwerp_Burggraafstraat_pdf',
        'https://example.com/files/groenontwerp.pdf'
      )
    ).to.equal('Groenontwerp Burggraafstraat (PDF)');
  });

  it('only strips a trailing suffix when it is a known extension', () => {
    expect(
      formatDocumentLabel(
        '20250630_Paneel_1_Ontwerp_pdf',
        'https://example.com/p1.pdf'
      )
    ).to.equal('20250630 Paneel 1 Ontwerp (PDF)');
  });

  it('handles hyphen-underscore combinations', () => {
    expect(
      formatDocumentLabel(
        'Reactienota_Rechters-_en_Kanunnikenbuurt_pdf',
        'https://example.com/r.pdf'
      )
    ).to.equal('Reactienota Rechters en Kanunnikenbuurt (PDF)');
  });

  it('supports regular dotted file names', () => {
    expect(formatDocumentLabel('rapport_2026.pdf', '')).to.equal(
      'Rapport 2026 (PDF)'
    );
  });

  it('ignores query strings in the URL', () => {
    expect(
      formatDocumentLabel(
        'verslag_docx',
        'https://example.com/verslag.docx?v=2'
      )
    ).to.equal('Verslag (DOCX)');
  });

  it('falls back to the URL file name when the name is empty', () => {
    expect(
      formatDocumentLabel('', 'https://example.com/files/begroting_2026.pdf')
    ).to.equal('Begroting 2026 (PDF)');
  });

  it('omits the type suffix when no extension can be derived', () => {
    expect(formatDocumentLabel('Toelichting bewonersavond', '')).to.equal(
      'Toelichting bewonersavond'
    );
  });

  it('appends a human-readable size in MB with Dutch notation', () => {
    expect(
      formatDocumentLabel('rapport_pdf', 'https://example.com/r.pdf', 1300000)
    ).to.equal('Rapport (PDF, 1,2 MB)');
  });

  it('formats sizes under 1 MB in kB', () => {
    expect(
      formatDocumentLabel('nota_pdf', 'https://example.com/n.pdf', 5000)
    ).to.equal('Nota (PDF, 5 kB)');
  });

  it('omits the size when it is not provided', () => {
    expect(
      formatDocumentLabel('nota_pdf', 'https://example.com/n.pdf')
    ).to.equal('Nota (PDF)');
  });

  it('omits the size when it is zero or invalid', () => {
    expect(
      formatDocumentLabel('nota_pdf', 'https://example.com/n.pdf', 0)
    ).to.equal('Nota (PDF)');
  });
});
