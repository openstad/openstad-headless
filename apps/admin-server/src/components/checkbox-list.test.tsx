// @vitest-environment jsdom
import { Form } from '@/components/ui/form';
import { useSyncDraftForm } from '@/hooks/useWidgetDraft';
import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { type UseFormReturn, useForm } from 'react-hook-form';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CheckboxList } from './checkbox-list';

vi.mock('next/router', () => ({
  useRouter: () => ({ query: {}, events: { on() {}, off() {}, emit() {} } }),
}));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

type Tag = { id: number; name: string };
type Values = { onlyIncludeTagIds: string };

let form: UseFormReturn<Values>;
const pushed: Array<[string, unknown]> = [];
const push = (name: string, value: unknown) => pushed.push([name, value]);

function Tab({ tags }: { tags: Tag[] }) {
  form = useForm<Values>({ defaultValues: { onlyIncludeTagIds: ',10,99' } });
  useSyncDraftForm(form, push);
  return (
    <Form {...form}>
      <CheckboxList
        form={form}
        fieldName="onlyIncludeTagIds"
        items={tags}
        keyPerItem={(t) => `${t.id}`}
        label={(t) => t.name}
        selectedPredicate={() => false}
        onValueChange={() => {}}
      />
    </Form>
  );
}

const wait = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 350));
  });

describe('CheckboxList clean-up of deleted tags', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    pushed.length = 0;
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('shows the list without deleted tags but does not mark it as an edit', async () => {
    act(() => root.render(<Tab tags={[]} />));
    act(() => root.render(<Tab tags={[{ id: 10, name: 'Groen' }]} />));
    await wait();
    expect(form.getValues('onlyIncludeTagIds')).toBe('10');
    expect(pushed).toEqual([]);
  });
});
