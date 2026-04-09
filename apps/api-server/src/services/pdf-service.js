/**
 * PDF generation service using the draad-pdf API.
 * Generates PDFs from questionsAndAnswers data (same data used for email content).
 * Requires PDF_API_ENDPOINT and PDF_API_KEY environment variables.
 */

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildPdfHtml(questionsAndAnswers, { title, description } = {}) {
  const rows = questionsAndAnswers
    .map(
      (qa) => `
      <tr class="question">
        <td>${escapeHtml(qa.question)}</td>
      </tr>
      <tr class="answer">
        <td>${escapeHtml(qa.answer)}</td>
      </tr>`
    )
    .join('');

  const titleHtml = title ? `<h1>${escapeHtml(title)}</h1>` : '';
  const descriptionHtml = description
    ? `<p class="description">${escapeHtml(description)}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 13px;
      color: #000;
      margin: 40px;
    }
    h1 {
      font-size: 20px;
      margin-bottom: 8px;
    }
    .description {
      font-size: 14px;
      color: #333;
      margin-bottom: 24px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #000;
    }
    tr.question td {
      background-color: #f0f0f0;
      padding: 10px;
      font-weight: bold;
    }
    tr.answer td {
      background-color: #fff;
      padding: 10px;
    }
    td {
      border: 1px solid #000;
    }
  </style>
</head>
<body>
  ${titleHtml}
  ${descriptionHtml}
  <table>
    <tbody>
      ${rows}
    </tbody>
  </table>
</body>
</html>`;
}

async function generatePdf(htmlString) {
  const endpoint = process.env.PDF_API_ENDPOINT;
  const apiKey = process.env.PDF_API_KEY;

  const formData = new FormData();
  formData.append(
    'html',
    new Blob([htmlString], { type: 'text/html' }),
    'template.html'
  );

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`PDF API returned ${response.status}: ${body}`);
  }

  const data = await response.json();
  if (!data.pdf_url) {
    throw new Error('PDF API response missing pdf_url');
  }

  const pdfResponse = await fetch(data.pdf_url, {
    signal: AbortSignal.timeout(15000),
  });

  if (!pdfResponse.ok) {
    throw new Error(
      `Failed to download PDF from ${data.pdf_url}: ${pdfResponse.status}`
    );
  }

  const arrayBuffer = await pdfResponse.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

module.exports = { buildPdfHtml, generatePdf };
