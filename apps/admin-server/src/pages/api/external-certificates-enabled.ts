import { NextApiRequest, NextApiResponse } from 'next/types';

/**
 * Returns the run-time EXTERNAL_CERTIFICATES_ENABLED environment variable.
 * Using NEXT_PUBLIC_ would bake the value in at build time, so we expose it
 * via this lightweight API route instead.
 */
export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.json({
    externalCertificatesEnabled: process.env.EXTERNAL_CERTIFICATES_ENABLED,
  });
}
