import { describe, expect, it, vi } from 'vitest';

const { renumber } = require('./seqnr');

describe('seqnr.renumber', () => {
  it('orders by seqnr and then id, so equal seqnrs keep their creation order', async () => {
    const instances = [{ update: vi.fn() }, { update: vi.fn() }];
    const model = { findAll: vi.fn().mockResolvedValue(instances) };

    await renumber({ model, where: { type: 'Thema' } });

    expect(model.findAll).toHaveBeenCalledWith({
      where: { type: 'Thema' },
      order: ['seqnr', 'id'],
    });
    expect(instances[0].update).toHaveBeenCalledWith(
      { seqnr: 10 },
      { hooks: false }
    );
    expect(instances[1].update).toHaveBeenCalledWith(
      { seqnr: 20 },
      { hooks: false }
    );
  });
});
