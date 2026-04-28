import { NextApiRequest, NextApiResponse } from 'next/types';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const spamFilterEnabled =
    process.env.SPAM_FILTER_ENABLED ||
    process.env.NEXT_PUBLIC_SPAM_FILTER_ENABLED ||
    'false';

  res.json({
    spamFilterEnabled,
  });
}
