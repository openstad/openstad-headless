import { describe, expect, test, vi } from 'vitest';

import { handleSubmit } from './submit';

const run = (
  submitHandler: (v: any) => any,
  pageHandler: (() => void) | null,
  submitBeforeLastPage?: boolean,
  navigateAfterSubmitSuccess?: boolean
) =>
  handleSubmit(
    [],
    { a: '1' },
    vi.fn(),
    [],
    submitHandler,
    pageHandler,
    submitBeforeLastPage,
    navigateAfterSubmitSuccess
  );

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('handleSubmit', () => {
  test('default order: page handler first, then submit handler', () => {
    const calls: string[] = [];
    run(
      () => {
        calls.push('submit');
      },
      () => calls.push('page'),
      true
    );
    expect(calls).toEqual(['page', 'submit']);
  });

  test('single page: submit handler gets the values right away', async () => {
    const submit = vi.fn(async () => true);
    const result = run(submit, null, undefined, true);
    expect(submit).toHaveBeenCalledTimes(1);
    expect(submit).toHaveBeenCalledWith({ a: '1' });
    expect(result.firstErrorKey).toBeNull();
    await flush();
    expect(submit).toHaveBeenCalledTimes(1);
  });

  test('without submitBeforeLastPage the submit handler is skipped', () => {
    const submit = vi.fn();
    const page = vi.fn();
    run(submit, page, false, true);
    expect(page).toHaveBeenCalledTimes(1);
    expect(submit).not.toHaveBeenCalled();
  });

  test('deferred navigation: page handler runs after submit resolves true', async () => {
    const calls: string[] = [];
    run(
      async () => {
        calls.push('submit');
        return true;
      },
      () => calls.push('page'),
      true,
      true
    );
    expect(calls).toEqual(['submit']);
    await flush();
    expect(calls).toEqual(['submit', 'page']);
  });

  test('no navigation when the submit handler returns false', async () => {
    const page = vi.fn();
    run(async () => false, page, true, true);
    await flush();
    expect(page).not.toHaveBeenCalled();
  });

  test('no navigation when the submit handler throws', async () => {
    const page = vi.fn();
    run(
      async () => {
        throw new Error('boom');
      },
      page,
      true,
      true
    );
    await flush();
    expect(page).not.toHaveBeenCalled();
  });
});
