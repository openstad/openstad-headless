import { NextApiRequest, NextApiResponse } from 'next/types';

import { resolveMaxUploadSizeMb } from '../../../proxy-body-limit';

const maxUploadSizeMb = resolveMaxUploadSizeMb(
  process.env.MAX_FILE_UPLOAD_SIZE_MB
);

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.json({
    maxUploadSizeMb,
  });
}
