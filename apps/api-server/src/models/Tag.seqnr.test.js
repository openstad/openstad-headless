import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const db = require('../db');

function newTag(fields) {
  return db.Tag.build({
    projectId: 1,
    name: 'Groen',
    type: 'Thema',
    addToNewResources: false,
    ...fields,
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Tag seqnr on create', () => {
  it('places a tag without seqnr below the highest seqnr of its type', async () => {
    const max = vi.spyOn(db.Tag, 'max').mockResolvedValue(30);
    const tag = newTag({ seqnr: null });

    await tag.validate();

    expect(tag.seqnr).toBe(40);
    expect(max).toHaveBeenCalledWith('seqnr', { where: { type: 'Thema' } });
  });

  it.each([undefined, ''])(
    'treats seqnr %j as not provided',
    async (emptySeqnr) => {
      vi.spyOn(db.Tag, 'max').mockResolvedValue(20);
      const tag = newTag({ seqnr: emptySeqnr });

      await tag.validate();

      expect(tag.seqnr).toBe(30);
    }
  );

  it('gives the first tag of an empty type group seqnr 10', async () => {
    vi.spyOn(db.Tag, 'max').mockResolvedValue(null);
    const tag = newTag({ seqnr: null });

    await tag.validate();

    expect(tag.seqnr).toBe(10);
  });

  it.each([0, 15, '25'])(
    'keeps an explicitly provided seqnr %j',
    async (providedSeqnr) => {
      const max = vi.spyOn(db.Tag, 'max');
      const tag = newTag({ seqnr: providedSeqnr });

      await tag.validate();

      expect(tag.seqnr).toBe(providedSeqnr);
      expect(max).not.toHaveBeenCalled();
    }
  );

  it('looks up the group by the sanitized type', async () => {
    const max = vi.spyOn(db.Tag, 'max').mockResolvedValue(10);
    const tag = newTag({ type: '  Thema  ', seqnr: null });

    await tag.validate();

    expect(max).toHaveBeenCalledWith('seqnr', { where: { type: 'Thema' } });
  });

  it('looks up tags without a type as their own group', async () => {
    const max = vi.spyOn(db.Tag, 'max').mockResolvedValue(10);
    const tag = newTag({ type: '', seqnr: null });

    await tag.validate();

    expect(max).toHaveBeenCalledWith('seqnr', { where: { type: null } });
    expect(tag.seqnr).toBe(20);
  });

  it.each(['abc', 1.5, true])(
    'rejects seqnr %j because it is not a whole number',
    async (invalidSeqnr) => {
      const max = vi.spyOn(db.Tag, 'max');
      const tag = newTag({ seqnr: invalidSeqnr });

      await expect(tag.validate()).rejects.toThrow(
        'Volgorde moet een geheel getal zijn'
      );
      expect(max).not.toHaveBeenCalled();
    }
  );

  it('does not fill in a seqnr for an existing tag', async () => {
    const max = vi.spyOn(db.Tag, 'max');
    const tag = db.Tag.build(
      {
        id: 5,
        projectId: 1,
        name: 'Groen',
        type: 'Thema',
        addToNewResources: false,
        seqnr: null,
      },
      { isNewRecord: false }
    );

    await expect(tag.validate()).rejects.toThrow();
    expect(max).not.toHaveBeenCalled();
  });
});
