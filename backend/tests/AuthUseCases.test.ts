import { jest } from '@jest/globals';
import { AuthUseCases } from '../src/usecases/auth/AuthUseCases.js';

describe('AuthUseCases account authorization', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-only-jwt-secret';
  });

  it('prevents the owner from removing their own owner role', async () => {
    const userRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 'owner-1',
        tenantId: 'tenant-1',
        role: 'owner',
      }),
      update: jest.fn(),
    };
    const useCases = new AuthUseCases(userRepository as never, {} as never);

    await expect(
      useCases.updateAccount('owner-1', 'owner', 'tenant-1', 'owner-1', {
        role: 'member',
      })
    ).rejects.toThrow('Owners cannot remove their own owner role');
    expect(userRepository.update).not.toHaveBeenCalled();
  });
});
