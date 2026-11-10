export default {
  fetchOptions: async function ({
    projectId,
    source,
    search,
    tags,
    exclude,
    limit,
    mine,
  }) {
    const params = new URLSearchParams(search ? { search } : {});
    if (mine) params.append('mine', '1');
    if (tags) params.append('tags', tags);
    if (exclude) params.append('exclude', exclude);
    if (limit) params.append('limit', String(limit));
    const url = `/api/project/${projectId}/link-options/${encodeURIComponent(
      source
    )}?${params.toString()}`;
    return this.fetch(url);
  },

  fetchItems: async function ({ projectId, source, ids }) {
    if (!Array.isArray(ids) || ids.length === 0) return [];
    const params = new URLSearchParams({ ids: ids.join(',') });
    const url = `/api/project/${projectId}/link-options/${encodeURIComponent(
      source
    )}/items?${params.toString()}`;
    return this.fetch(url);
  },

  fetchSelection: async function ({ projectId, resourceId }) {
    const url = `/api/project/${projectId}/resource/${resourceId}/links/selection`;
    return this.fetch(url);
  },

  fetchLinks: async function ({ projectId, resourceId }) {
    const url = `/api/project/${projectId}/resource/${resourceId}/links`;
    return this.fetch(url);
  },

  sendContact: async function ({ projectId, resourceId }, data) {
    const url = `/api/project/${projectId}/resource/${resourceId}/contact`;
    return this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },
};
