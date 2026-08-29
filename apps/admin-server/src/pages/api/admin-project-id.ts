import { NextApiRequest, NextApiResponse } from 'next/types';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.json({ adminProjectId: Number(process.env.ADMIN_PROJECTID) || 1 });
}
