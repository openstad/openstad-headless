import express from 'express';
import multer from 'multer';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import {
  consumeUploadBudget,
  createRequestBudgetStorage,
  createValidatingDocumentStorage,
} from './upload-guards.js';

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

function documentApp() {
  const upload = multer({
    storage: createValidatingDocumentStorage(
      multer.memoryStorage(),
      1024 * 1024
    ),
    limits: { fileSize: 1024 * 1024 },
  });
  const app = express();
  app.post('/document', upload.single('document'), (req, res) => {
    res.status(200).json({ ok: true });
  });
  app.use((err, req, res, next) => {
    const status =
      err.status || (err.code === 'UNSUPPORTED_DOCUMENT_TYPE' ? 415 : 500);
    res.status(status).json({ error: err.message });
  });
  return app;
}

describe('document upload magic bytes', () => {
  it('rejects a file declared as image/png whose bytes are not an image', async () => {
    const res = await request(documentApp())
      .post('/document')
      .attach('document', Buffer.from('this is plain text, not an image'), {
        filename: 'photo.png',
        contentType: 'image/png',
      });

    expect(res.status).toBe(415);
  });

  it('accepts a file whose bytes are a png, whatever the declared type is', async () => {
    const res = await request(documentApp())
      .post('/document')
      .attach('document', PNG_SIGNATURE, {
        filename: 'notes.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(200);
  });
});

describe('per-request upload size cap', () => {
  it('rejects once the bytes in the request pass the cap', async () => {
    const upload = multer({
      storage: createRequestBudgetStorage(multer.memoryStorage(), 10),
      limits: { fileSize: 1024 },
    });
    const app = express();
    app.post('/image', upload.single('image'), (req, res) => {
      res.status(200).json({ ok: true });
    });
    app.use((err, req, res, next) => {
      res.status(err.status || 500).json({ error: err.message });
    });

    const res = await request(app)
      .post('/image')
      .attach('image', Buffer.alloc(11), {
        filename: 'a.jpg',
        contentType: 'image/jpeg',
      });

    expect(res.status).toBe(413);
  });

  it('counts bytes across the request', () => {
    const req = {};
    expect(consumeUploadBudget(req, 6, 10)).toBeNull();
    expect(consumeUploadBudget(req, 6, 10)).toMatchObject({ status: 413 });
    expect(req.uploadBytes).toBe(6);
  });
});
