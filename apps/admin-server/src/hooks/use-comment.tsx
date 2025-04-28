import useSWR from 'swr';

export default function useComment(projectId?: string, id?: string) {
  if (projectId && (!/^\d+$/.test(projectId.toString()))) {
    projectId = undefined;
  }

  if (id && (!/^\d+$/.test(id.toString()))) {
    id = undefined;
  }

  const url = `/api/openstad/api/project/${projectId}/comment/${id}`;

  const commentSwr = useSWR(projectId && id ? url : null);

  async function updateComment(description: string, label: string) {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, description, label }),
    });

    return await res.json();
  }

  return {...commentSwr, updateComment}
}