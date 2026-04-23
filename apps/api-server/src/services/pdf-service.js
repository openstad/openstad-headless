/**
 * PDF generation service using the draad-pdf API.
 * Generates PDFs from questionsAndAnswers data (same data used for email content).
 * Requires PDF_API_ENDPOINT and PDF_API_KEY environment variables.
 */

function stripHtml(str) {
  if (typeof str !== 'string') return '';
  let result = str;
  let prev;
  do {
    prev = result;
    result = result.replace(/<[^>]*>/g, '');
  } while (result !== prev);
  return result.trim();
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function sanitizeAnswer(str) {
  if (typeof str !== 'string') return '';
  // Preserve <a> tags but strip all other HTML
  const preserved = [];
  let result = str.replace(/<a\s[^>]*>.*?<\/a>/gi, (match) => {
    preserved.push(match);
    return `%%LINK${preserved.length - 1}%%`;
  });
  let prev;
  do {
    prev = result;
    result = result.replace(/<[^>]*>/g, '');
  } while (result !== prev);
  result = result.trim();
  preserved.forEach((link, i) => {
    result = result.replace(`%%LINK${i}%%`, link);
  });
  return result;
}

function buildPdfHtml(
  questionsAndAnswers,
  { title, description, logoUrl } = {}
) {
  const rows = questionsAndAnswers
    .map((qa) => {
      if (qa.section !== undefined) {
        return `
      <tr class="section">
        <td colspan="2">${stripHtml(qa.section)}</td>
      </tr>`;
      }
      return `
      <tr>
        <td class="question">${stripHtml(qa.question)}</td>
        <td class="answer">${qa.answer != null ? sanitizeAnswer(String(qa.answer)) : '-'}</td>
      </tr>`;
    })
    .join('');

  const logoHtml = logoUrl
    ? `<img src="${escapeAttr(logoUrl)}" alt="Logo" class="logo" />`
    : '';
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
      font-size: 14px;
      color: #1a1a1a;
      margin: 60px 80px;
    }
    .logo {
      max-height: 60px;
      max-width: 220px;
      margin-bottom: 32px;
    }
    h1 {
      font-size: 28px;
      font-weight: bold;
      color: #000;
      margin: 0 0 12px 0;
    }
    .description {
      font-size: 14px;
      color: #1a1a1a !important;
      text-decoration: none;
      margin: 0 0 24px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    tr {
      border: 1px solid #e0e0e0;
    }
    tr.section {
      page-break-after: avoid;
    }
    tr.section td {
      background-color: #f7f7f7;
      padding: 12px 14px;
      font-weight: bold;
      font-size: 14px;
      color: #000;
    }
    td.question {
      width: 35%;
      padding: 14px 14px;
      vertical-align: top;
      color: #1a1a1a;
    }
    td.answer {
      width: 65%;
      padding: 14px 14px;
      vertical-align: top;
      color: #000;
    }
    td.answer a {
      color: #1a56db;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  ${logoHtml}
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
  formData.append('save', 'false');

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

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function fetchImageAsDataUrl(url) {
  if (!url || url.startsWith('data:')) return url;
  // Replace external image URL with internal Docker URL for container-to-container fetch
  let fetchUrl = url;
  if (process.env.IMAGE_APP_URL && process.env.IMAGE_APP_URL_INTERNAL) {
    fetchUrl = url.replace(
      process.env.IMAGE_APP_URL,
      process.env.IMAGE_APP_URL_INTERNAL
    );
  }
  const response = await fetch(fetchUrl, {
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Image fetch failed: ${response.status}`);
  const contentType = response.headers.get('content-type') || 'image/png';
  if (!contentType.startsWith('image/')) {
    throw new Error(`Expected image content-type, got: ${contentType}`);
  }
  const contentLength = parseInt(
    response.headers.get('content-length') || '0',
    10
  );
  if (contentLength > 2 * 1024 * 1024) {
    throw new Error(`Image too large: ${contentLength} bytes`);
  }
  const arrayBuffer = await response.arrayBuffer();
  if (arrayBuffer.byteLength > 2 * 1024 * 1024) {
    throw new Error(`Image too large: ${arrayBuffer.byteLength} bytes`);
  }
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  return `data:${contentType};base64,${base64}`;
}

module.exports = {
  buildPdfHtml,
  generatePdf,
  fetchImageAsDataUrl,
  escapeHtml,
  escapeAttr,
  stripHtml,
};
