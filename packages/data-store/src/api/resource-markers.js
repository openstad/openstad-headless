export default {
  fetch: async function (
    {
      projectId,
      search,
      tags,
      excludeTags,
      statuses,
      excludeStatuses,
      tagGroups,
      lat,
      lng,
      maxDistance,
    },
    options
  ) {
    const params = new URLSearchParams();

    if (search) {
      params.append('search[text]', search);
    }

    if (Array.isArray(tagGroups) && tagGroups.length > 0) {
      params.append('tagGroups', JSON.stringify(tagGroups));
    }

    if (lat != null && lng != null && maxDistance) {
      params.append('lat', lat);
      params.append('lng', lng);
      params.append('maxDistance', maxDistance);
    }

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

    let url = `/api/project/${projectId}/resource/markers?${params.toString()}`;
    return this.fetch(url, options);
  },
};
