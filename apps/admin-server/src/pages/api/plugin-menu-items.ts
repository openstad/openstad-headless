import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const apiUrl = process.env.API_URL_INTERNAL || process.env.API_URL || '';

  try {
    const response = await fetch(`${apiUrl}/api/plugin/registry`);
    if (!response.ok) {
      return res.json([]);
    }

    const registry = await response.json();
    return res.json(registry.menuItems || []);
  } catch {
    return res.json([]);
  }
}
