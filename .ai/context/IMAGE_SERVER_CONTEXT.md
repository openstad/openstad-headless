# image-server

`apps/image-server` — stateless Express service for image/document uploads and on-the-fly
resizing/cropping. No database.

## Stack

- Express 4, plain JavaScript, flat layout: `server.js` (entry), `s3.js`, `utils.js`
- **image-steam** (git-pinned dependency) for URL-based transformations; **sharp** underneath
  (the Dockerfile reinstalls sharp for the build architecture)
- **multer** / **multer-s3** for uploads; storage is either local filesystem
  (`IMAGES_DIR`, `DOCUMENTS_DIR`) or S3 (`S3_ENDPOINT`, `S3_BUCKET`, `S3_KEY`, `S3_SECRET`)

## Two listeners

| Listener                                           | Env var                                         | Default dev port |
| -------------------------------------------------- | ----------------------------------------------- | ---------------- |
| Upload API (multer endpoints)                      | `IMAGE_PORT_API` / `PORT_API`                   | 31450            |
| Image serving (image-steam, resize via URL params) | `IMAGE_PORT_IMAGE_SERVER` / `PORT_IMAGE_SERVER` | 31451            |

## Auth

Uploads are protected by the shared secret `IMAGE_VERIFICATION_TOKEN`; the api-server holds the
same token and mints short-lived upload JWTs for browser uploads
(`apps/api-server/src/middleware/user.js`). There is no client registry or database.

## Configuration knobs

`MAX_FILE_UPLOAD_SIZE_MB` (default 25), allowed image extensions
(jpg/jpeg/png/gif/bmp/webp/tiff), `HQ_ORIGINAL_MAX_PIXELS`, `DISABLE_WEBP_CONVERSION`,
`THROTTLE*` limits, cache TTLs.

## Notes

- Consumed by the api-server (`IMAGE_APP_URL_INTERNAL`) and indirectly by widgets/CMS via image
  URLs.
- The only unit test is `utils.test.js` (Vitest via `npm run test:unit:image` from the root).
