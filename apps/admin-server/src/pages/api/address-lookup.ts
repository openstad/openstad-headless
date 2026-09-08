import { NextApiRequest, NextApiResponse } from 'next/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const baseUrl = process.env.ZIPCODE_API_URL;
  if (!baseUrl) {
    return res.status(503).json({ error: 'ZIPCODE_API_URL is not configured' });
  }

  const postcode =
    typeof req.query.postcode === 'string'
      ? req.query.postcode.replace(/\s+/g, '').toUpperCase()
      : '';
  const huisnummer =
    typeof req.query.huisnummer === 'string' ? req.query.huisnummer.trim() : '';

  if (!/^[1-9][0-9]{3}[A-Z]{2}$/.test(postcode) || huisnummer === '') {
    return res.status(400).json({ error: 'Invalid postcode or huisnummer' });
  }

  try {
    const response = await fetch(
      `${baseUrl}${postcode}/${encodeURIComponent(huisnummer)}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!response.ok) {
      return res.status(502).json({ error: 'Address lookup failed' });
    }
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({ error: 'Address lookup failed' });
  }
}
