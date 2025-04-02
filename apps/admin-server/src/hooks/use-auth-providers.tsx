import { useState, useEffect } from 'react';
import useSWR from 'swr';

let cachedAuthProvidersEnabled: boolean | null = null;

export function useAuthProvidersEnabledCheck() {
  const [authProvidersEnabled, setAuthProvidersEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    if (cachedAuthProvidersEnabled !== null) {
      setAuthProvidersEnabled(cachedAuthProvidersEnabled);
      return;
    }

    const checkAuthProvidersEnabled = async () => {
      try {
        const response = await fetch('/api/auth-providers-enabled');
        const data = await response.json();
        cachedAuthProvidersEnabled = data.authProvidersEnabled === 'true';
        setAuthProvidersEnabled(cachedAuthProvidersEnabled);
      } catch (error) {
        console.error('Error fetching auth adapter status:', error);
        setAuthProvidersEnabled(false); // or handle error state as needed
      }
    };

    checkAuthProvidersEnabled();
  }, []);

  return authProvidersEnabled;
}

export default function useAuthProvidersList() {

  let authProvidersListSwrKey =`/api/openstad/api/auth-provider?includeConfig=1`;

  let authProvidersListSwr = useSWR(authProvidersListSwrKey);
  return { ...authProvidersListSwr };
}

export function useAuthProvider(id?: string) {
  let authProviderSwrKey = `/api/openstad/api/auth-provider/${id}`;
  let authProviderSwr = useSWR(id ? authProviderSwrKey : null);

  async function updateAuthProvider(body: any) {

    let id = !!body?.id ? parseInt(body.id, 10) : null;

    if (!id) {
      throw new Error('Deze auth provider kan niet worden bewerkt');
    }

    let url = `/api/openstad/api/auth-provider/${id}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...body }),
    });
    if (!res.ok) throw new Error('Auth provider update failed')

    return await res.json();

  }

  async function createAuthProvider(name: string, config: object) {
    console.log ('create auth provider');
    const res = await fetch('/api/openstad/api/auth-provider', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        config
      }),
    });
    return await res.json();
  }

  async function deleteAuthProvider(id: string) {
    console.log ('delete auth provider', id);
    const res = await fetch(`/api/openstad/api/auth-provider/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    return await res.json();

  }

  return { ...authProviderSwr, updateAuthProvider, createAuthProvider, deleteAuthProvider};
}
