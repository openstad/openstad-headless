function resolveRandomSortSeed(randomSortRotationMs) {
  const storedSeed = localStorage.getItem('pseudoRandomSortSeed');
  const storedTimestamp = localStorage.getItem('pseudoRandomSortSeedTimestamp');

  const needsNewSeed =
    !storedSeed ||
    (randomSortRotationMs &&
      (!storedTimestamp ||
        Date.now() - Number(storedTimestamp) > randomSortRotationMs));

  if (needsNewSeed) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    localStorage.setItem('pseudoRandomSortSeed', String(array[0]));
    localStorage.setItem('pseudoRandomSortSeedTimestamp', String(Date.now()));
  }

  return localStorage.getItem('pseudoRandomSortSeed');
}

export default {
  fetch: async function (
    {
      projectId,
      page,
      pageSize,
      search,
      tags,
      excludeTags,
      sort,
      statuses,
      excludeStatuses,
      tagGroups,
      lat,
      lng,
      maxDistance,
      noPagination,
      projectIds,
      allowMultipleProjects,
      randomSortRotationMs,
    },
    options
  ) {
    const params = new URLSearchParams();

    if (Array.isArray(tags) && tags.length > 0) {
      tags.forEach((tag) => params.append('tags', tag));
    }

    if (Array.isArray(excludeTags) && excludeTags.length > 0) {
      excludeTags.forEach((tag) => params.append('excludeTags', tag));
    }

    if (Array.isArray(statuses) && statuses.length > 0) {
      statuses.forEach((status) => params.append('statuses', status));
    }

    if (Array.isArray(excludeStatuses) && excludeStatuses.length > 0) {
      excludeStatuses.forEach((status) =>
        params.append('excludeStatuses', status)
      );
    }

    if (Array.isArray(tagGroups) && tagGroups.length > 0) {
      params.append('tagGroups', JSON.stringify(tagGroups));
    }

    if (lat != null && lng != null && maxDistance) {
      params.append('lat', lat);
      params.append('lng', lng);
      params.append('maxDistance', maxDistance);
    }

    if (search) {
      params.append('search[text]', search);
    }

    if (sort) {
      if (!Array.isArray(sort)) sort = [sort];
      sort.map((criterium) => params.append('sort', criterium));
      if (sort.includes('random'))
        params.append(
          'pseudoRandomSortSeed',
          resolveRandomSortSeed(randomSortRotationMs)
        );
    }

    if (noPagination) {
      params.append('noPagination', 'true');
    } else if (page >= 0 && pageSize) {
      params.append('page', page);
      params.append('pageSize', pageSize);
    } else if (pageSize >= 0) {
      params.append('page', 0);
      params.append('pageSize', pageSize);
    }

    if (projectIds && projectIds.length > 0 && allowMultipleProjects) {
      projectIds.forEach((projectId) => params.append('projectIds', projectId));
    }

    let url = `/api/project/${projectId}/resource?includeUser=1&includeUserVote=1&includeVoteCount=1&includeTags=1&includeCommentsCount=1&${params.toString()}`;
    return this.fetch(url, options);
  },

  delete: async function ({ projectId, resourceId }, data) {
    let url = `/api/project/${projectId}/resource/${data.id}`;
    let method = 'delete';
    let newData = await this.fetch(url, { method });
    return { id: data.id };
  },

  create: async function ({ projectId, widgetId }, data) {
    delete data.id;

    let url = `/api/project/${projectId}/resource`;
    let method = 'POST';

    if (widgetId) {
      data.widgetId = widgetId;
    }

    let body = JSON.stringify(data);

    return await this.fetch(url, { method, body });
  },

  submitLike: async function ({ projectId }, resources) {
    if (!Array.isArray(resources)) throw new Error('Resources is geen array');
    if (resources.some((r) => !('resourceId' in r) || !('opinion' in r)))
      throw new Error('Ontbrekende velden resourceId of opinion');

    let url = `/api/project/${projectId}/vote`;
    let headers = {
      'Content-Type': 'application/json',
    };

    let json = await this.fetch(url, {
      headers,
      method: 'POST',
      body: JSON.stringify(resources),
    });

    return json;
  },
};
