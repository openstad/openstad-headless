// @vitest-environment jsdom
import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  SaveControllerProvider,
  useRegisterSave,
  useSaveController,
} from './save-controller';

vi.mock('next/router', () => ({
  useRouter: () => ({ events: { on() {}, off() {}, emit() {} } }),
}));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

type Controller = ReturnType<typeof useSaveController>;
type Form = { label: string; isDirty: boolean; save: () => Promise<void> };

let controller: Controller;

function Mail({ label, isDirty, save }: Form) {
  useRegisterSave({ label, isDirty, save });
  return null;
}

function Page({ forms }: { forms: Form[] }) {
  controller = useSaveController();
  return (
    <>
      {forms.map((form) => (
        <Mail key={form.label} {...form} />
      ))}
    </>
  );
}

const flush = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

describe('one save for several forms on a page (notification mails)', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const show = (forms: Form[]) =>
    act(() =>
      root.render(
        <SaveControllerProvider>
          <Page forms={forms} />
        </SaveControllerProvider>
      )
    );

  it('names the form that failed, saves the others, and retries only that one', async () => {
    const invalid = (): Promise<void> =>
      Promise.reject(new Error('Controleer de gemarkeerde velden.'));
    const saveA = vi.fn(invalid);
    const saveB = vi.fn(() => Promise.resolve());
    show([
      { label: 'Mail A', isDirty: true, save: saveA },
      { label: 'Mail B', isDirty: true, save: saveB },
    ]);
    act(() => controller.triggerSave());
    await flush();
    expect(controller.state).toBe('error');
    expect(controller.errorMessage).toBe(
      'Mail A: Controleer de gemarkeerde velden. De overige wijzigingen zijn wel opgeslagen.'
    );

    saveA.mockImplementation(() => Promise.resolve());
    show([
      { label: 'Mail A', isDirty: true, save: saveA },
      { label: 'Mail B', isDirty: false, save: saveB },
    ]);
    act(() => controller.triggerSave());
    await flush();
    expect(saveA).toHaveBeenCalledTimes(2);
    expect(saveB).toHaveBeenCalledTimes(1);
    show([
      { label: 'Mail A', isDirty: false, save: saveA },
      { label: 'Mail B', isDirty: false, save: saveB },
    ]);
    expect(controller.state).toBe('success');
    expect(controller.errorMessage).toBeNull();
  });

  it('lists every form that failed', async () => {
    const invalid = (): Promise<void> =>
      Promise.reject(new Error('Controleer de gemarkeerde velden.'));
    show([
      { label: 'Mail A', isDirty: true, save: invalid },
      { label: 'Mail B', isDirty: true, save: () => Promise.resolve() },
      { label: 'Mail C', isDirty: true, save: invalid },
    ]);
    act(() => controller.triggerSave());
    await flush();
    expect(controller.errorMessage).toBe(
      'De volgende onderdelen konden niet worden opgeslagen: "Mail A", "Mail C". De overige wijzigingen zijn wel opgeslagen.'
    );
  });
});
