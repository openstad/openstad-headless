import { NextResponse } from 'next/server';
import { NextApiResponse } from "next/types";

/**
 * This handler returns the run-time environment variable ENABLE_AUTH_PROVIDERS
 * If we use NEXT_PUBLIC_ in this application, it will be defined in build time.
 */
export default function handler(res: NextApiResponse) {
  res.status(200).json({ authProvidersEnabled: process.env.ENABLE_AUTH_PROVIDERS });
}
