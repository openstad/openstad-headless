// @vitest-environment jsdom
import { zodResolver } from '@hookform/resolvers/zod';
import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { type UseFormReturn, useController, useForm } from 'react-hook-form';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as z from 'zod';

import { validateForSave } from './save-controller';

vi.mock('next/router', () => ({
  useRouter: () => ({ events: { on() {}, off() {}, emit() {} } }),
}));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const schema = z.object({ description: z.string().min(5) });
type Values = z.infer<typeof schema>;

let form: UseFormReturn<Values>;
let onChange: (value: string) => void;

function Description() {
  const { field } = useController({
    name: 'description',
    control: form.control,
  });
  onChange = field.onChange;
  return null;
}

function Page({ defaults }: { defaults: Values }) {
  form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });
  return <Description />;
}

describe('validateForSave', () => {
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

  it('clears a field message once the field is fixed after a failed save', async () => {
    act(() => root.render(<Page defaults={{ description: 'long enough' }} />));
    act(() => onChange(''));

    let valid = true;
    await act(async () => {
      valid = await validateForSave(form);
    });
    expect(valid).toBe(false);
    expect(form.getFieldState('description').error).toBeDefined();

    await act(async () => onChange('long enough'));
    expect(form.getFieldState('description').error).toBeUndefined();
  });

  it('passes a valid form', async () => {
    act(() => root.render(<Page defaults={{ description: 'long enough' }} />));
    let valid = false;
    await act(async () => {
      valid = await validateForSave(form);
    });
    expect(valid).toBe(true);
  });
});
