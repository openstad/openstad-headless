import { useRouter } from 'next/router';
import useSWR from 'swr';
import {validateProjectNumber} from "@/lib/validateProjectNumber";

export function useProject(scopes?: Array<string>) {
  const router = useRouter();
  let projectId = router.query.project;

  let projectNumber: number | undefined = validateProjectNumber(projectId)

  let useScopes: Array<string> = ['includeConfig', 'includeEmailConfig']
  if (scopes) useScopes = useScopes.concat(scopes);

  const projectSwr = useSWR(
    projectNumber
      ? `/api/openstad/api/project/${projectNumber}?${ useScopes.map(s => `${s}=1`).join('&') }`
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
              }
            }
          }
        }
      }),
    });
    return await res.json();
  }
  
  async function importProject(name: string, title: string, config: object, emailConfig: object) {
    const res = await fetch('/api/openstad/api/project', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        title,
        config,
        emailConfig
      }),
    });
    return await res.json();
  }

  async function updateProject(config: any, name?: any, url?: any) {
    if (name) {
      const res = await fetch(`/api/openstad/api/project/${projectNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config, name, url}),
      });
      const data = await res.json();

      projectSwr.mutate(data);

      return await data;
    } else {
      const res = await fetch(`/api/openstad/api/project/${projectNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config }),
      });
      const data = await res.json();

      projectSwr.mutate(data);

      return await data;
    }
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

  return {
    ...projectSwr,
    createProject,
    importProject,
    updateProject,
    updateProjectEmails,
    anonymizeUsersOfProject,
  };
}
