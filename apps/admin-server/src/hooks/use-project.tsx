import { useRouter } from 'next/router';
import useSWR from 'swr';

export function useProject() {
  const router = useRouter();
  const projectId = router.query.project;

  const projectSwr = useSWR(
    projectId
      ? `/api/openstad/api/project/${projectId}?includeConfig=1&includeEmailConfig=1`
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
      }),
    });
    const data = await res.json();
    return data;
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
    const data = await res.json();
    return data;
  }

  async function updateProject(config: any, name?: any) {
    if (name) {
      const res = await fetch(`/api/openstad/api/project/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config, name }),
      });
      const data = await res.json();

      projectSwr.mutate(data);
    } else {
      const res = await fetch(`/api/openstad/api/project/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config }),
      });
      const data = await res.json();

      projectSwr.mutate(data);
    }
  }

  async function updateProjectEmails(emailConfig: any) {
    const res = await fetch(`/api/openstad/api/project/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emailConfig }),
    });
    const data = await res.json();

    projectSwr.mutate(data);
  }

  async function anonymizeUsersOfProject() {
    const res = await fetch(
      `/api/openstad/api/project/${projectId}/do-anonymize-all-users`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    const data = await res.json();
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
