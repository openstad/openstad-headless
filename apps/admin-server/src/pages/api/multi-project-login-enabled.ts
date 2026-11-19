import { NextApiRequest, NextApiResponse } from 'next/types';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.json({
    multiProjectLogin: process.env.MULTI_PROJECT_LOGIN === 'true',
  });
}
