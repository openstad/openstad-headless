import path from 'path';
import { describe, expect, it, vi } from 'vitest';

// Redirect the package import to the local worktree file so tests can run
// before npm install has updated the shared node_modules.
vi.mock('@openstad-headless/lib/report-data-scope', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require(
    path.resolve(__dirname, '../../../../packages/lib/report-data-scope')
  );
});

const { matchComponent } = require('@openstad-headless/lib/report-data-scope');

describe('matchComponent', () => {
  it('matches a plain component segment', () => {
    expect(matchComponent('/project/1/resource')).toBe('resources');
    expect(matchComponent('/project/1/vote')).toBe('votes');
    expect(matchComponent('/project/1/comment')).toBe('comments');
    expect(matchComponent('/project/1/submission')).toBe('submissions');
  });

  it('matches both singular and plural choiceguide spellings', () => {
    expect(matchComponent('/project/1/choicesguide')).toBe('choiceguides');
    expect(matchComponent('/project/1/choicesguides')).toBe('choiceguides');
  });

  it('anchors on the last component segment of nested routes', () => {
    expect(matchComponent('/project/1/resource/5/comment')).toBe('comments');
    expect(matchComponent('/project/1/resource/5')).toBe('resources');
  });

  it('does not false-positive on substrings', () => {
    expect(matchComponent('/project/1/resources-evil')).toBeNull();
    expect(matchComponent('/project/1/user')).toBeNull();
    expect(matchComponent('/project/1/audit-log')).toBeNull();
    expect(matchComponent('/project/1/overview')).toBeNull();
  });
});
