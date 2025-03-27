import useSWR from 'swr';

export default function useChoiceGuideResults(projectId: string) {
  let url = `/api/openstad/api/project/${projectId}/choicesguide`;

  async function remove(id: string|number) {
    const res = await fetch(`${url}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error('Could not remove the choiceguide result');
    }
  }

  return { remove };
}