import type { Root } from 'react-dom/client';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import { builtinEnvironments } from 'vitest/environments';

import type { ComboboxOption, ComboboxProps } from './index';

type LoadOptions = ComboboxProps['loadOptions'];

let teardownDom: (global: any) => unknown;
let React: typeof import('react');
let createRoot: typeof import('react-dom/client').createRoot;
let Combobox: typeof import('./index').Combobox;
let container: HTMLDivElement;
let root: Root;

beforeAll(async () => {
  ({ teardown: teardownDom } = await builtinEnvironments.jsdom.setup(
    globalThis,
    {}
  ));
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  React = await import('react');
  ({ createRoot } = await import('react-dom/client'));
  ({ Combobox } = await import('./index'));
});

afterAll(async () => {
  await teardownDom(globalThis);
});

function Harness({
  loadOptions,
  minQueryLength,
}: {
  loadOptions: LoadOptions;
  minQueryLength?: number;
}) {
  const [selected, setSelected] = React.useState<ComboboxOption[]>([]);
  return (
    <Combobox
      id="combobox"
      selected={selected}
      onChange={setSelected}
      loadOptions={loadOptions}
      loadOnFocus={true}
      debounceMs={0}
      minQueryLength={minQueryLength}
    />
  );
}

async function render(props: {
  loadOptions: LoadOptions;
  minQueryLength?: number;
}) {
  await React.act(async () => {
    root.render(<Harness {...props} />);
  });
}

async function settle() {
  await React.act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

const input = () =>
  container.querySelector<HTMLInputElement>('input[role="combobox"]')!;
const listbox = () =>
  container.querySelector<HTMLUListElement>('ul#combobox-listbox')!;
const optionLabels = () =>
  Array.from(listbox().querySelectorAll('[role="option"]')).map(
    (option) => option.textContent
  );

async function focusInput() {
  await React.act(async () => input().focus());
}

async function type(value: string) {
  await React.act(async () => {
    const setValue = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value'
    )!.set!;
    setValue.call(input(), value);
    input().dispatchEvent(new Event('input', { bubbles: true }));
  });
}

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await React.act(async () => root.unmount());
  container.remove();
});

describe('Combobox', () => {
  test('opens the list again on a click after choosing an option', async () => {
    const loadOptions = vi.fn<LoadOptions>().mockResolvedValue([
      { id: '1', label: 'StadmakersTafel' },
      { id: '2', label: 'Draad inzending' },
    ]);
    await render({ loadOptions });

    await focusInput();
    await settle();
    expect(listbox().hidden).toBe(false);

    await React.act(async () =>
      (listbox().querySelector('[role="option"]') as HTMLElement).click()
    );
    expect(listbox().hidden).toBe(true);
    expect(document.activeElement).toBe(input());

    await React.act(async () => input().click());
    await settle();

    expect(loadOptions).toHaveBeenCalledTimes(2);
    expect(listbox().hidden).toBe(false);
    expect(optionLabels()).toEqual(['Draad inzending']);
  });

  test('aborts the running request when typing', async () => {
    const signals: AbortSignal[] = [];
    const loadOptions = vi.fn<LoadOptions>((_query, signal) => {
      signals.push(signal);
      return new Promise<ComboboxOption[]>(() => {});
    });
    await render({ loadOptions, minQueryLength: 1 });

    await focusInput();
    await settle();
    await type('S');
    await settle();

    expect(loadOptions.mock.calls.map(([query]) => query)).toEqual(['', 'S']);
    expect(signals[0].aborted).toBe(true);
    expect(signals[1].aborted).toBe(false);
  });

  test('searches from one character without a minimum length hint', async () => {
    const loadOptions = vi
      .fn<LoadOptions>()
      .mockResolvedValue([{ id: '1', label: 'StadmakersTafel' }]);
    await render({ loadOptions, minQueryLength: 1 });

    await focusInput();
    await type('S');
    await settle();

    expect(loadOptions).toHaveBeenLastCalledWith('S', expect.any(AbortSignal));
    expect(container.textContent).not.toContain('Typ minimaal');
    expect(optionLabels()).toEqual(['StadmakersTafel']);
  });

  test('shows the minimum length hint with the default minimum', async () => {
    const loadOptions = vi.fn<LoadOptions>().mockResolvedValue([]);
    await render({ loadOptions });

    await focusInput();
    await type('S');
    await settle();

    expect(loadOptions).not.toHaveBeenCalledWith('S', expect.anything());
    expect(container.textContent).toContain(
      'Typ minimaal 2 tekens om te zoeken'
    );
  });
});
