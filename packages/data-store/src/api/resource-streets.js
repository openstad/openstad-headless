export default {
  fetch: async function ({
    projectId,
    excludeTags,
    statuses,
    excludeStatuses,
    tagGroups,
  }) {
    const params = new URLSearchParams();

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

    let url = `/api/project/${projectId}/resource/streets?${params.toString()}`;
    return this.fetch(url);
  },
};
