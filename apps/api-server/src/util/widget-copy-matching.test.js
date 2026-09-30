import { describe, expect, it } from 'vitest';

import {
  buildIdMap,
  indexByIdentity,
  statusIdentity,
  tagIdentity,
} from './widget-copy-matching.js';

describe('buildIdMap with tagIdentity', () => {
  it('matches a source tag to the target tag with the same type and name', () => {
    const source = [{ id: 10, type: 'theme', name: 'Groen' }];
    const target = [
      { id: 30, type: 'area', name: 'Groen' },
      { id: 31, type: 'theme', name: 'Groen' },
    ];
    expect(buildIdMap(source, target, tagIdentity)).toEqual({ 10: 31 });
  });

  // The reviewer's concern on PR #64: matching on the name alone maps a source
  // tag onto a target tag of a different type.
  it('does not match a same-named tag of a different type', () => {
    const source = [{ id: 10, type: 'theme', name: 'Centrum' }];
    const target = [{ id: 30, type: 'area', name: 'Centrum' }];
    expect(buildIdMap(source, target, tagIdentity)).toEqual({});
  });

  it('leaves out a tag whose identity is ambiguous in the target project', () => {
    // Two target tags with the same type and name: there is no way to tell which
    // one was meant, so the reference is dropped rather than guessed.
    const source = [{ id: 10, type: 'theme', name: 'Groen' }];
    const target = [
      { id: 30, type: 'theme', name: 'Groen' },
      { id: 31, type: 'theme', name: 'Groen' },
    ];
    expect(buildIdMap(source, target, tagIdentity)).toEqual({});
  });

  it('treats a missing type as its own identity rather than a wildcard', () => {
    const source = [{ id: 10, name: 'Groen' }];
    const target = [{ id: 30, type: 'theme', name: 'Groen' }];
    expect(buildIdMap(source, target, tagIdentity)).toEqual({});
  });

  it('omits source tags that have no equivalent at all', () => {
    const source = [
      { id: 10, type: 'theme', name: 'Groen' },
      { id: 11, type: 'theme', name: 'Blauw' },
    ];
    const target = [{ id: 30, type: 'theme', name: 'Groen' }];
    expect(buildIdMap(source, target, tagIdentity)).toEqual({ 10: 30 });
  });
});

describe('buildIdMap with statusIdentity', () => {
  it('matches statuses by name', () => {
    const source = [{ id: 5, name: 'Open' }];
    const target = [{ id: 60, name: 'Open' }];
    expect(buildIdMap(source, target, statusIdentity)).toEqual({ 5: 60 });
  });

  it('leaves out a status name that occurs twice in the target project', () => {
    const source = [{ id: 5, name: 'Open' }];
    const target = [
      { id: 60, name: 'Open' },
      { id: 61, name: 'Open' },
    ];
    expect(buildIdMap(source, target, statusIdentity)).toEqual({});
  });
});

describe('indexByIdentity', () => {
  it('keeps the first row per identity and removes every duplicate identity', () => {
    const index = indexByIdentity(
      [
        { id: 1, name: 'a' },
        { id: 2, name: 'b' },
        { id: 3, name: 'a' },
      ],
      statusIdentity
    );
    expect([...index.entries()]).toEqual([['b', 2]]);
  });
});
