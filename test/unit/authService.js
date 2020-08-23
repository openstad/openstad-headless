'use strict';

require('process').env.OAUTHRECIPES_SURPRESS_TRACE = true;

const authService  = require('../../services/authService');
const userRepository  = require('../../repositories/userRepository');

jest.mock('../../repositories/userRepository');

describe('AuthService', () => {

  describe('validatePrivilegeUser', () => {
    test('should throw an Error when user not found', async () => {
      expect(authService.validatePrivilegeUser('some email', 'some client')).rejects.toEqual(new Error('User not found or user does not have the allowed roles'))
    });

    test('should return the user when user is valid', async () => {
      userRepository.getUserByClientAndRoles.mockResolvedValue({
        email: 'test@test.nl',
        clientId: 1
      });

      expect(authService.validatePrivilegeUser('test@test.nl', '1')).resolves.toEqual({
        email: 'test@test.nl',
        clientId: 1
      })
    });
  });
});
