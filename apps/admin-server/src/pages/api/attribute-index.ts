import { NextApiRequest, NextApiResponse } from 'next';

export default async function getAttributeIndex(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await fetch('https://attribute-index.yivi.app/index.json');
    if (!response.ok) {
      return res.status(502).json({ error: 'Could not fetch attribute index' });
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Could not fetch attribute index' });
  }
}
