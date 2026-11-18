// Vitest setup for the auth-server project.
//
// utils.js reads the JWT signing key at module-load time. The real `certs/`
// directory is gitignored and is not generated in the unit-test CI job, so tests
// that import the real utils/oauth code would otherwise fail with ENOENT.
//
// Instead of committing a key, we generate a throwaway RSA keypair in memory on
// every test run and hand it to utils.js via the env vars it already prefers over
// the on-disk certs (PRIVATE_KEY_BASE64 / PUBLIC_KEY_BASE64). Nothing is written
// to disk or committed: each run (local and CI) gets a fresh test-only key that
// signs/verifies JWTs and protects nothing real.
const { generateKeyPairSync } = require('crypto');

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

process.env.PRIVATE_KEY_BASE64 = Buffer.from(privateKey).toString('base64');
process.env.PUBLIC_KEY_BASE64 = Buffer.from(publicKey).toString('base64');
