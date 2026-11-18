import { afterEach, describe, expect, test, vi } from 'vitest';

import {
  lookupLocationAddress,
  resolveLocationAddress,
} from './location-address.js';

const reverseApiUrl = 'https://cdn.example/api/reverse.php';
const address = { street: 'Grote Markt', city: 'Zwolle' };

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('resolveLocationAddress', () => {
  test('new record with coordinates: looks up and stores the address', async () => {
    const lookup = vi.fn(async () => address);

    const result = await resolveLocationAddress({
      location: { lat: 52.5, lng: 6.09 },
      previous: undefined,
      isNewRecord: true,
      reverseApiUrl,
      lookup,
    });

    expect(lookup).toHaveBeenCalledWith(
      { lat: 52.5, lng: 6.09 },
      reverseApiUrl
    );
    expect(result).toEqual({ lat: 52.5, lng: 6.09, address });
  });

  test('submitted address is ignored and replaced by the lookup', async () => {
    const lookup = vi.fn(async () => address);

    const result = await resolveLocationAddress({
      location: { lat: 52.5, lng: 6.09, address: { street: 'Nep', city: 'X' } },
      previous: undefined,
      isNewRecord: true,
      reverseApiUrl,
      lookup,
    });

    expect(lookup).toHaveBeenCalledWith(
      { lat: 52.5, lng: 6.09 },
      reverseApiUrl
    );
    expect(result).toEqual({ lat: 52.5, lng: 6.09, address });
  });

  test('update with unchanged coordinates keeps the previous address', async () => {
    const lookup = vi.fn();

    const result = await resolveLocationAddress({
      location: { lat: 52.5, lng: 6.09 },
      previous: { lat: 52.5, lng: 6.09, address },
      isNewRecord: false,
      reverseApiUrl,
      lookup,
    });

    expect(lookup).not.toHaveBeenCalled();
    expect(result).toEqual({ lat: 52.5, lng: 6.09, address });
  });

  test('update with unchanged coordinates ignores a submitted address', async () => {
    const lookup = vi.fn();

    const result = await resolveLocationAddress({
      location: { lat: 52.5, lng: 6.09, address: { street: 'Nep', city: 'X' } },
      previous: { lat: 52.5, lng: 6.09, address },
      isNewRecord: false,
      reverseApiUrl,
      lookup,
    });

    expect(lookup).not.toHaveBeenCalled();
    expect(result).toEqual({ lat: 52.5, lng: 6.09, address });
  });

  test('update with new coordinates looks up a new address', async () => {
    const newAddress = { street: 'Melkmarkt', city: 'Zwolle' };
    const lookup = vi.fn(async () => newAddress);

    const result = await resolveLocationAddress({
      location: { lat: 52.51, lng: 6.1 },
      previous: { lat: 52.5, lng: 6.09, address },
      isNewRecord: false,
      reverseApiUrl,
      lookup,
    });

    expect(lookup).toHaveBeenCalledWith(
      { lat: 52.51, lng: 6.1 },
      reverseApiUrl
    );
    expect(result).toEqual({ lat: 52.51, lng: 6.1, address: newAddress });
  });

  test('failing lookup saves coordinates only and logs the error', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const lookup = vi.fn(async () => {
      throw new Error('timeout');
    });

    const result = await resolveLocationAddress({
      location: { lat: 52.5, lng: 6.09 },
      previous: undefined,
      isNewRecord: true,
      reverseApiUrl,
      lookup,
    });

    expect(result).toEqual({ lat: 52.5, lng: 6.09 });
    expect(errorSpy).toHaveBeenCalledWith(
      'Reverse address lookup failed, saving location without address:',
      'timeout'
    );
  });

  test('lookup without a result saves coordinates only', async () => {
    const lookup = vi.fn(async () => null);

    const result = await resolveLocationAddress({
      location: { lat: 52.5, lng: 6.09 },
      previous: undefined,
      isNewRecord: true,
      reverseApiUrl,
      lookup,
    });

    expect(result).toEqual({ lat: 52.5, lng: 6.09 });
  });

  test('without a reverse API url no lookup is done', async () => {
    const lookup = vi.fn();

    const result = await resolveLocationAddress({
      location: { lat: 52.5, lng: 6.09, address: { street: 'Nep', city: 'X' } },
      previous: undefined,
      isNewRecord: true,
      reverseApiUrl: undefined,
      lookup,
    });

    expect(lookup).not.toHaveBeenCalled();
    expect(result).toEqual({ lat: 52.5, lng: 6.09 });
  });

  test('location without coordinates is returned unchanged', async () => {
    const lookup = vi.fn();

    for (const location of [null, undefined, {}, { lat: 'abc', lng: 6 }]) {
      const result = await resolveLocationAddress({
        location,
        previous: undefined,
        isNewRecord: true,
        reverseApiUrl,
        lookup,
      });
      expect(result).toBe(location);
    }
    expect(lookup).not.toHaveBeenCalled();
  });
});

describe('lookupLocationAddress', () => {
  test('requests lat and lng and maps straat and woonplaats', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        results: [
          { straat: 'Grote Markt', woonplaats: 'Zwolle', gemeente: 'Zwolle' },
        ],
      }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await lookupLocationAddress(
      { lat: 52.5, lng: 6.09 },
      reverseApiUrl
    );

    const requestedUrl = new URL(fetchMock.mock.calls[0][0]);
    expect(requestedUrl.origin + requestedUrl.pathname).toBe(reverseApiUrl);
    expect(requestedUrl.searchParams.get('lat')).toBe('52.5');
    expect(requestedUrl.searchParams.get('lng')).toBe('6.09');
    expect(result).toEqual(address);
  });

  test('returns null when no address is found', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => ({ results: [] }) }))
    );

    const result = await lookupLocationAddress(
      { lat: 52.5, lng: 6.09 },
      reverseApiUrl
    );

    expect(result).toBeNull();
  });

  test('throws when the service responds with an error status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 500 }))
    );

    await expect(
      lookupLocationAddress({ lat: 52.5, lng: 6.09 }, reverseApiUrl)
    ).rejects.toThrow('Reverse address lookup failed with status 500');
  });
});
