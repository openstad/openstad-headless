import { validateProjectNumber } from '@/lib/validateProjectNumber';
import { useRouter } from 'next/router';
import useSWR from 'swr';

export function useProject(scopes?: Array<string>) {
  const router = useRouter();
  let projectId = router.query.project;

  let projectNumber: number | undefined = validateProjectNumber(projectId);

  let useScopes: Array<string> = ['includeConfig', 'includeEmailConfig'];
  if (scopes) useScopes = useScopes.concat(scopes);

  const projectSwr = useSWR(
    projectNumber
      ? `/api/openstad/api/project/${projectNumber}?${useScopes
          .map((s) => `${s}=1`)
          .join('&')}`
      : null
  );

  const pdfStatusSwr = useSWR(
    projectNumber
      ? `/api/openstad/api/project/${projectNumber}/pdf/status`
      : null
  );

  async function createProject(name: string) {
    const res = await fetch('/api/openstad/api/project', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        config: {
          auth: {
            provider: {
              openstad: {
                name: `${name} normal`,
                adapter: 'openstad',
                authTypes: 'Url',
              },
              anonymous: {
                name: `${name} anonymous`,
                adapter: 'openstad',
                authTypes: 'Anonymous',
                requiredUserFields: 'postcode',
              },
            },
          },
        },
      }),
    });
    return await res.json();
  }

  async function importProject(
    name: string,
    title: string,
    config: object,
    emailConfig: object
  ) {
    const res = await fetch('/api/openstad/api/project', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        title,
        config,
        emailConfig,
      }),
    });
    return await res.json();
  }

  async function updateProject(config: any, name?: any, url?: any) {
    const body: { config: any; name?: string; url?: string } = { config };
    if (name) {
      body.name = name;
    }
    if (url !== undefined) {
      body.url = url;
    }

    const res = await fetch(`/api/openstad/api/project/${projectNumber}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.message || 'Er is helaas iets mis gegaan.' };
    }

    projectSwr.mutate(data);

    return data;
  }

  async function updateProjectEmails(emailConfig: any) {
    const res = await fetch(`/api/openstad/api/project/${projectNumber}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emailConfig }),
    });
    const data = await res.json();

    projectSwr.mutate(data);

    return await data;
  }

  async function anonymizeUsersOfProject() {
    const res = await fetch(
      `/api/openstad/api/project/${projectNumber}/do-anonymize-all-users`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) {
      throw new Error('Could not anonymize users of the project');
    }
  }

  async function waitForDuplication(
    projectId: number | string,
    { interval = 1500, timeoutMs = 15 * 60 * 1000 } = {}
  ): Promise<{ status: string; errors: any[]; duplicatedData?: any }> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, interval));
      try {
        const res = await fetch(
          `/api/openstad/api/project/${projectId}/duplication-status`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'done') return { status: 'done', errors: [] };
          if (data.status === 'failed')
            return {
              status: 'failed',
              errors: data.errors || [],
              duplicatedData: data.duplicatedData,
            };
        }
      } catch (e) {}
    }
    return {
      status: 'timeout',
      errors: [
        {
          step: 'Duplicatie',
          error: 'Het aanmaken duurt langer dan verwacht.',
        },
      ],
    };
  }

  return {
    ...projectSwr,
    pdfAvailable: pdfStatusSwr.data?.available ?? null,
    createProject,
    importProject,
    updateProject,
    updateProjectEmails,
    anonymizeUsersOfProject,
    waitForDuplication,
  };
}
