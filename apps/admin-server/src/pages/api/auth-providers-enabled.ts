/**
 * This handler returns the run-time environment variable ENABLE_AUTH_PROVIDERS
 * If we use NEXT_PUBLIC_ in this application, it will be defined in build time.
 */
export default function handler(req, res) {
  res.status(200).json({ authProvidersEnabled: process.env.ENABLE_AUTH_PROVIDERS });
}
