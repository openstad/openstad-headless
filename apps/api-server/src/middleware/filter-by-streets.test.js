import { describe, expect, test, vi } from 'vitest';

const filterByStreets = require('./filter-by-streets');

const resource = (id, street, city) => ({
  id,
  location: { lat: 52.5, lng: 6.09, address: { street, city } },
});

const results = () => [
  resource(1, 'Koestraat', 'Zwolle'),
  resource(2, 'Grote Kerkplein', 'Zwolle'),
  resource(3, 'Koestraat', 'Amsterdam'),
  { id: 4, location: { lat: 52.5, lng: 6.09 } },
];

function run(query, dbQuery = { count: 4 }) {
  const req = { query, results: results(), dbQuery };
  const next = vi.fn();
  filterByStreets(req, {}, next);
  return { req, next };
}

describe('filterByStreets', () => {
  test('passes through when no streets param is given', () => {
    const { req, next } = run({});

    expect(next).toHaveBeenCalledWith();
    expect(req.results).toHaveLength(4);
    expect(req.dbQuery.count).toBe(4);
  });

  test('responds with 400 for an invalid streets param', () => {
    const { next } = run({ streets: 'not json' });

    const error = next.mock.calls[0][0];
    expect(error.status).toBe(400);
  });

  test('passes through for an empty list', () => {
    const { req, next } = run({ streets: '[]' });

    expect(next).toHaveBeenCalledWith();
    expect(req.results).toHaveLength(4);
  });

  test('keeps only resources on the selected street and city', () => {
    const { req, next } = run({
      streets: JSON.stringify([{ street: 'Koestraat', city: 'Zwolle' }]),
    });

    expect(next).toHaveBeenCalledWith();
    expect(req.results.map((item) => item.id)).toEqual([1]);
    expect(req.dbQuery.count).toBe(1);
  });

  test('keeps resources for any of several selected streets', () => {
    const { req } = run({
      streets: JSON.stringify([
        { street: 'Koestraat', city: 'Zwolle' },
        { street: 'Grote Kerkplein', city: 'Zwolle' },
      ]),
    });

    expect(req.results.map((item) => item.id)).toEqual([1, 2]);
  });

  test('works without a dbQuery, as on the markers route', () => {
    const req = {
      query: {
        streets: JSON.stringify([{ street: 'Koestraat', city: 'Zwolle' }]),
      },
      results: results(),
    };
    const next = vi.fn();

    filterByStreets(req, {}, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.results.map((item) => item.id)).toEqual([1]);
  });
});
