import { jest } from '@jest/globals';
import { TaskUseCases } from '../src/usecases/task/TaskUseCases.js';

describe('TaskUseCases relation isolation', () => {
  it('rejects an assigned user outside the authenticated tenant', async () => {
    const repository = { create: jest.fn() };
    const prisma = {
      user: { findFirst: jest.fn().mockResolvedValue(null) },
      leadActivity: { findFirst: jest.fn() },
      dealActivity: { findFirst: jest.fn() },
    };
    const useCase = new TaskUseCases(repository as never, prisma as never);

    await expect(
      useCase.create({ title: 'Follow up', assignedUserId: 'user-2' }, 'tenant-1')
    ).rejects.toThrow('Assigned user not found');

    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { id: 'user-2', tenantId: 'tenant-1' },
      select: { id: true },
    });
    expect(repository.create).not.toHaveBeenCalled();
  });
});
