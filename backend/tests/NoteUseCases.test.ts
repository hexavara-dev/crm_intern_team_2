import { jest } from '@jest/globals';
import { NoteUseCases } from '../src/usecases/note/NoteUseCases.js';

describe('NoteUseCases relation isolation', () => {
  it('rejects a lead activity outside the authenticated tenant', async () => {
    const repository = { create: jest.fn() };
    const prisma = {
      leadActivity: { findFirst: jest.fn().mockResolvedValue(null) },
      dealActivity: { findFirst: jest.fn() },
    };
    const useCase = new NoteUseCases(repository as never, prisma as never);

    await expect(
      useCase.create(
        { content: 'Private note', leadActivityId: 'activity-2' },
        'tenant-1'
      )
    ).rejects.toThrow('Lead activity not found');

    expect(prisma.leadActivity.findFirst).toHaveBeenCalledWith({
      where: { id: 'activity-2', tenantId: 'tenant-1' },
      select: { id: true },
    });
    expect(repository.create).not.toHaveBeenCalled();
  });
});
