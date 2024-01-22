import mjml2html from 'mjml';

export function renderEmail(mjml: string) {
  const result = mjml2html(mjml);
  if (result.errors.length) {
    throw new Error(
      'Could not parse MJML: ' + result.errors.map((e: any) => e.message).join(', ')
    )
  }
  return result.html;
}