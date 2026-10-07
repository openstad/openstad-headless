import { describe, expect, test } from 'vitest';

const { isLoginTokenForProject } = require('./login-token');

describe('isLoginTokenForProject', () => {
  test('consumes a token for this project', () => {
    expect(
      isLoginTokenForProject(
        { openstadlogintoken: 'jwt', openstadprojectid: '4' },
        4
      )
    ).toBe(true);
  });

  test('consumes a token without a project id (older links)', () => {
    expect(isLoginTokenForProject({ openstadlogintoken: 'jwt' }, 4)).toBe(true);
  });

  test('leaves a token for another project to its widget', () => {
    expect(
      isLoginTokenForProject(
        { openstadlogintoken: 'jwt', openstadprojectid: '5' },
        4
      )
    ).toBe(false);
  });

  test('ignores a request without a token', () => {
    expect(isLoginTokenForProject({}, 4)).toBe(false);
  });
});
