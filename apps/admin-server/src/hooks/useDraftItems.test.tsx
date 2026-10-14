// @vitest-environment jsdom
import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import {
  type Mock,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { type ItemsUpdater, useDraftItems } from './useDraftItems';

type TestItem = {
  id?: string;
  trigger: string;
  title?: string;
  active?: boolean;
};

// React's `act` needs this flag to suppress its "not wrapped in act" warning.
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

type Harness<T extends { id?: string }> = {
  items: () => T[];
  commit: (updater: ItemsUpdater<T>) => void;
  commitOutsideAct: (updater: ItemsUpdater<T>) => void;
  rerender: (nextItems: T[] | undefined) => void;
  unmount: () => void;
};

/**
 * Mount the hook in a component that renders nothing and expose its current
 * value. The tab components under test never render their list from props, so
 * a null-rendering probe is enough and keeps the test free of DOM assertions.
 */
function mountHook<T extends { id?: string }>(
  initialItems: T[] | undefined,
  onFieldChanged?: (key: string, value: any) => void,
  options?: Parameters<typeof useDraftItems<T>>[2]
): Harness<T> {
  const container = document.createElement('div');
  document.body.appendChild(container);
  let root: Root;

  let latestItems: T[] = [];
  let latestCommit: (updater: ItemsUpdater<T>) => void = () => {};

  function Probe({ propsItems }: { propsItems: T[] | undefined }) {
    const [items, commitItems] = useDraftItems<T>(
      propsItems,
      onFieldChanged,
      options
    );
    latestItems = items;
    latestCommit = commitItems;
    return null;
  }

  act(() => {
    root = createRoot(container);
    root.render(<Probe propsItems={initialItems} />);
  });

  return {
    items: () => latestItems,
    commit: (updater) => act(() => latestCommit(updater)),
    commitOutsideAct: (updater) => latestCommit(updater),
    rerender: (nextItems) =>
      act(() => {
        root.render(<Probe propsItems={nextItems} />);
      }),
    unmount: () =>
      act(() => {
        root.unmount();
        container.remove();
      }),
  };
}

describe('useDraftItems', () => {
  let onFieldChanged: Mock<(key: string, value: any) => void>;
  let harness: Harness<TestItem> | undefined;

  beforeEach(() => {
    onFieldChanged = vi.fn<(key: string, value: any) => void>();
    harness = undefined;
  });

  afterEach(() => {
    harness?.unmount();
  });

  const storedItem: TestItem = { id: 'stored-1', trigger: '1', title: 'Vraag' };
  const legacyItem: TestItem = { trigger: '1', title: 'Legacy vraag' };

  it('does not write to the draft on mount', () => {
    harness = mountHook([storedItem], onFieldChanged);

    expect(onFieldChanged).not.toHaveBeenCalled();
    expect(harness.items()).toEqual([storedItem]);
  });

  it('never writes an empty list to the draft while seeded items exist', () => {
    harness = mountHook([storedItem], onFieldChanged);
    harness.rerender([storedItem]);
    harness.commit((current) =>
      current.map((item) => ({ ...item, title: 'Nieuw' }))
    );

    const emptyWrites = onFieldChanged.mock.calls.filter(
      ([, value]) => Array.isArray(value) && value.length === 0
    );
    expect(emptyWrites).toEqual([]);
  });

  it('writes the full list when an item is added', () => {
    harness = mountHook([storedItem], onFieldChanged);
    const added: TestItem = { id: 'new-1', trigger: '2', title: 'Tweede' };

    harness.commit((current) => [...current, added]);

    expect(onFieldChanged).toHaveBeenCalledTimes(1);
    expect(onFieldChanged).toHaveBeenLastCalledWith('items', [
      storedItem,
      added,
    ]);
  });

  it('keeps ids generated during seeding out of the draft, so a legacy videoSlider keeps trigger-based field keys', () => {
    harness = mountHook([legacyItem], onFieldChanged);

    // The editor needs an id locally to address the row.
    expect(harness.items()[0].id).toBeTruthy();

    harness.commit((current) =>
      current.map((item) => ({ ...item, title: 'Gewijzigd' }))
    );

    expect(onFieldChanged).toHaveBeenLastCalledWith('items', [
      { trigger: '1', title: 'Gewijzigd' },
    ]);
  });

  it('keeps stored ids and ids created by the editor in the draft', () => {
    harness = mountHook([storedItem], onFieldChanged);
    const created: TestItem = { id: 'editor-made', trigger: '2' };

    harness.commit((current) => [...current, created]);

    const [, written] = onFieldChanged.mock.calls[0];
    expect(written.map((item: TestItem) => item.id)).toEqual([
      'stored-1',
      'editor-made',
    ]);
  });

  it('resolves two edits made in the same tick against the latest list', () => {
    harness = mountHook([storedItem], onFieldChanged);

    // One act() means React has not re-rendered in between, so a version that
    // read `items` from the render closure would lose the first edit.
    act(() => {
      harness!.commitOutsideAct((current) => [
        ...current,
        { id: 'a', trigger: '2' },
      ]);
      harness!.commitOutsideAct((current) => [
        ...current,
        { id: 'b', trigger: '3' },
      ]);
    });

    expect(onFieldChanged).toHaveBeenLastCalledWith('items', [
      storedItem,
      { id: 'a', trigger: '2' },
      { id: 'b', trigger: '3' },
    ]);
  });

  it('applies toDraft to the draft payload but leaves local state untouched', () => {
    harness = mountHook([storedItem], onFieldChanged, {
      toDraft: (next) =>
        next.map((item) => ({ ...item, active: item.active ?? false })),
    });

    harness.commit((current) => [...current]);

    expect(onFieldChanged).toHaveBeenLastCalledWith('items', [
      { ...storedItem, active: false },
    ]);
    expect(harness.items()[0]).not.toHaveProperty('active');
  });

  it('does not reseed when props.items changes after mount', () => {
    harness = mountHook([storedItem], onFieldChanged);

    harness.rerender([{ id: 'other', trigger: '9', title: 'Andere widget' }]);

    expect(harness.items()).toEqual([storedItem]);
    expect(onFieldChanged).not.toHaveBeenCalled();
  });

  it('does nothing when onFieldChanged is not provided', () => {
    harness = mountHook([storedItem], undefined);

    expect(() => harness!.commit([])).not.toThrow();
    expect(harness.items()).toEqual([]);
  });

  it('writes to a custom field name when one is given', () => {
    harness = mountHook([storedItem], onFieldChanged, { field: 'questions' });

    harness.commit((current) => [...current]);

    expect(onFieldChanged).toHaveBeenLastCalledWith('questions', [storedItem]);
  });

  it('seeds an empty list without writing to the draft', () => {
    harness = mountHook(undefined, onFieldChanged);

    expect(harness.items()).toEqual([]);
    expect(onFieldChanged).not.toHaveBeenCalled();
  });
});
