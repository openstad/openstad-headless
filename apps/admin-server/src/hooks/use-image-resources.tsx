import useSWR from 'swr';

export default function useImageResources(projectId?: string) {

  const url = `/api/openstad/api/project/${projectId}/image-resource?includeUserVote=1&includeVoteCount=1`;

  const imageResourcesListSwr = useSWR(projectId ? url : null);

  async function create(body: any) {
    const createUrl = `/api/openstad/api/project/${projectId}/image-resource`;

    const res = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...body }),
    });

    console.log( 'RES', res );

    if (res.ok) {
      const data = await res.json();
      imageResourcesListSwr.mutate([...imageResourcesListSwr.data, data]);
      return data;
    } else {
      throw new Error('Could not create the image resource');
    }
  }

  async function update(id: number, body: any) {
    const updateUrl = `/api/openstad/api/project/${projectId}/image-resource/${id}?includeUserVote=1`;

    const res = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...body }),
    });

    if (res.ok) {
      const data = await res.json();
      const existingData = [...imageResourcesListSwr.data];
      const updatedList = existingData.filter((ed) => ed.id !== data.id);
      updatedList.push(data);
      imageResourcesListSwr.mutate(updatedList);
      return data;
    } else {
      throw new Error('Could not update the image resource');
    }
  }

  async function remove(id: number) {
    const deleteUrl = `/api/openstad/api/project/${projectId}/image-resource/${id}?includeUserVote=1`;

    const res = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      const existingData = [...imageResourcesListSwr.data];
      const updatedList = existingData.filter((ed) => ed.id !== id);
      imageResourcesListSwr.mutate(updatedList);
      return updatedList;
    } else {
      throw new Error('Could not remove the image resource');
    }
  }
  return { ...imageResourcesListSwr, create, update, remove };
}
