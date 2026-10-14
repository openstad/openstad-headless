// @vitest-environment jsdom
import {
  SaveControllerProvider,
  useSaveController,
} from '@/components/ui/save-controller';
import UserGeneral from '@/pages/users/[user]/general';
import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

const user = vi.hoisted(() => ({ data: undefined as any, saved: [] as any[] }));

vi.mock('next/router', () => ({
  useRouter: () => ({
    query: { user: 'MTI=' },
    pathname: '/users/[user]',
    events: { on() {}, off() {}, emit() {} },
  }),
}));

vi.mock('@/hooks/use-user', () => ({
  default: () => ({
    data: user.data,
    mutate: async () => {},
    anonymizeUser: async () => {},
    updateUser: async (body: unknown) => {
      user.saved.push(body);
      return body;
    },
  }),
}));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let controller: ReturnType<typeof useSaveController>;

function Bar() {
  controller = useSaveController();
  return null;
}

const settle = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });

describe('E-mailadres on the user page', () => {
  let container: HTMLDivElement;
  let root: Root;

  async function open(email: string | null) {
    vi.stubGlobal('fetch', async () => ({
      json: async () => ({ twoFactorEnabled: false }),
    }));
    user.saved = [];
    user.data = { id: 12, projectId: 2, name: 'Jan', email };
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    act(() =>
      root.render(
        <SaveControllerProvider>
          <Bar />
          <UserGeneral />
        </SaveControllerProvider>
      )
    );
    await settle();
  }

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  function typeInto(name: string, value: string) {
    const input = container.querySelector(
      `input[name="${name}"]`
    ) as HTMLInputElement;
    const setValue = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value'
    )!.set!;
    act(() => {
      setValue.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  async function save() {
    act(() => controller.triggerSave());
    await settle();
  }

  it('stops a save that empties a stored address', async () => {
    await open('jan@example.org');
    typeInto('email', '');
    await settle();
    await save();

    expect(user.saved).toHaveLength(0);
    expect(controller.errorMessage).toBe(
      '"E-mailadres" kan niet leeg worden opgeslagen. Vul een e-mailadres in.'
    );
  });

  it('saves a user without an address, without sending an empty address', async () => {
    await open(null);
    typeInto('name', 'Jan B');
    await settle();
    await save();

    expect(controller.errorMessage).toBeNull();
    expect(user.saved).toHaveLength(1);
    expect(user.saved[0]).not.toHaveProperty('email');
    expect(user.saved[0].name).toBe('Jan B');
  });

  it('still sends a stored address with another change', async () => {
    await open('jan@example.org');
    typeInto('name', 'Jan B');
    await settle();
    await save();

    expect(user.saved[0].email).toBe('jan@example.org');
  });
});
