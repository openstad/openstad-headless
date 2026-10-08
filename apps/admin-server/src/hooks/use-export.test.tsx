import { validateProjectNumber } from '@/lib/validateProjectNumber';
import useSWR from 'swr';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import useExport from './use-export';

vi.mock('swr', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/validateProjectNumber', () => ({
  validateProjectNumber: vi.fn(),
}));

describe('useExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('builds the export URL and calls useSWR for a valid project number', () => {
    vi.mocked(validateProjectNumber).mockReturnValue(42);
    vi.mocked(useSWR).mockReturnValue({ data: { ok: true }, isLoading: false });

    const result = useExport('42');

    expect(validateProjectNumber).toHaveBeenCalledWith('42');
    expect(useSWR).toHaveBeenCalledWith('/api/openstad/api/project/42/export');
    expect(result).toEqual({ data: { ok: true }, isLoading: false });
    expect(result).not.toBe(vi.mocked(useSWR).mock.results[0].value);
  });

  it('passes null to useSWR when project number is invalid', () => {
    vi.mocked(validateProjectNumber).mockReturnValue(undefined);
    vi.mocked(useSWR).mockReturnValue({ data: undefined, error: undefined });

    const result = useExport('not-a-number');

    expect(validateProjectNumber).toHaveBeenCalledWith('not-a-number');
    expect(useSWR).toHaveBeenCalledWith(null);
    expect(result).toEqual({ data: undefined, error: undefined });
  });

  it('validates undefined projectId when called without an argument', () => {
    vi.mocked(validateProjectNumber).mockReturnValue(undefined);
    vi.mocked(useSWR).mockReturnValue({ data: undefined });

    useExport();

    expect(validateProjectNumber).toHaveBeenCalledWith(undefined);
    expect(useSWR).toHaveBeenCalledWith(null);
  });
});
