module.exports = {
  extend: '@apostrophecms/page-type',
  options: {
    label: 'Sitemap',
  },
  handlers(self) {
    return {
      '@apostrophecms/page:beforeSend': {
        async addSitemapTree(req) {
          if (req.data.page?.type !== 'sitemap-page') {
            return;
          }

          const pages = await self.apos.page
            .find(req, {})
            .areas(false)
            .relationships(false)
            .children(false)
            .ancestors(false)
            .project({
              title: 1,
              slug: 1,
              path: 1,
              level: 1,
              rank: 1,
              type: 1,
            })
            .sort({ level: 1, rank: 1 })
            .toArray();

          const byPath = new Map();
          const tree = [];

          for (const page of pages) {
            const node = { title: page.title, url: page._url, children: [] };
            byPath.set(page.path, node);

            if (page.level === 0) {
              tree.push(node);
              continue;
            }

            const parentPath = page.path.split('/').slice(0, -1).join('/');
            const parent = byPath.get(parentPath);
            if (parent) {
              parent.children.push(node);
            } else {
              tree.push(node);
            }
          }

          req.data.sitemapTree = tree;
        },
      },
    };
  },
};
