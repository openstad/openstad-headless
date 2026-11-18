import { describe, expect, test, vi } from 'vitest';

const searchInResults = require('./search-in-results');

const items = () => [
  {
    id: 1,
    title: 'Speeltuin in het park',
    description: 'Nieuwe toestellen',
    tags: [{ name: 'Zuid' }, { name: 'Groen' }],
    statuses: [{ name: 'open', label: 'In behandeling' }],
    user: { name: 'Jan Jansen', email: 'jan@example.com' },
    replies: [{ description: 'Goed plan' }],
  },
  {
    id: 2,
    title: 'Bankje bij de school',
    description: 'Meer zitplekken',
    tags: [{ name: 'Noord' }],
    statuses: [{ name: 'done', label: 'Uitgevoerd' }],
    user: { name: 'Piet Pietersen', email: 'piet@example.com' },
    replies: [],
  },
];

function run(searchfields, search, req = {}) {
  const request = { ...req, query: { search }, results: items() };
  const next = vi.fn();
  searchInResults({ searchfields })(request, {}, next);
  return { ids: request.results.map((item) => item.id), next };
}

describe('searchInResults', () => {
  test('passes through without a search query', () => {
    const request = { query: {}, results: items() };
    const next = vi.fn();

    searchInResults({ searchfields: ['title'] })(request, {}, next);

    expect(next).toHaveBeenCalledWith();
    expect(request.results).toHaveLength(2);
  });

  test('matches plain fields regardless of case', () => {
    expect(run(['title'], { text: 'SPEELTUIN' }).ids).toEqual([1]);
  });

  test('requires every word to match, possibly in different fields', () => {
    expect(
      run(['title', 'description'], { text: 'speeltuin toestellen' }).ids
    ).toEqual([1]);
    expect(
      run(['title', 'description'], { text: 'speeltuin zitplekken' }).ids
    ).toEqual([]);
  });

  test('searches values inside a list such as tags', () => {
    expect(run(['tags.name'], { text: 'noord' }).ids).toEqual([2]);
  });

  test('searches values inside a list such as statuses', () => {
    expect(run(['statuses.label'], { text: 'uitgevoerd' }).ids).toEqual([2]);
  });

  test('still searches reply descriptions', () => {
    expect(run(['replies.description'], { text: 'goed plan' }).ids).toEqual([
      1,
    ]);
  });

  test('searches nested object fields', () => {
    expect(run(['user.email'], { text: 'piet@example' }).ids).toEqual([2]);
  });

  test('accepts searchfields as a function of the request', () => {
    const searchfields = vi.fn((req) =>
      req.user?.role === 'admin' ? ['title', 'user.email'] : ['title']
    );

    expect(
      run(
        searchfields,
        { text: 'jan@example.com' },
        { user: { role: 'admin' } }
      ).ids
    ).toEqual([1]);
    expect(
      run(
        searchfields,
        { text: 'jan@example.com' },
        { user: { role: 'member' } }
      ).ids
    ).toEqual([]);
    expect(searchfields).toHaveBeenCalled();
  });

  test('a field-specific search only looks at that field', () => {
    expect(
      run(['title', 'description'], { description: 'speeltuin' }).ids
    ).toEqual([]);
    expect(
      run(['title', 'description'], { description: 'toestellen' }).ids
    ).toEqual([1]);
  });
});
