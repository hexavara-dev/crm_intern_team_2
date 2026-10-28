import { jest } from '@jest/globals';
import { ViewingUseCase } from '../src/usecases/viewing/ViewingUseCase.js';

describe('ViewingUseCase tenant isolation', () => {
  it('does not fail a viewing that is outside the authenticated tenant', async () => {
    const viewingRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      update: jest.fn(),
    };
    const statusRepository = { findOne: jest.fn() };
    const useCase = new ViewingUseCase(
      viewingRepository as never,
      statusRepository as never,
      {} as never,
      {} as never
    );

    await expect(useCase.failViewing('viewing-1', 'tenant-1', 'No show')).rejects.toThrow(
      'Viewing not found'
    );

    expect(viewingRepository.findOne).toHaveBeenCalledWith(
      { id: 'viewing-1', tenantId: 'tenant-1' },
      expect.any(Object)
    );
    expect(statusRepository.findOne).not.toHaveBeenCalled();
    expect(viewingRepository.update).not.toHaveBeenCalled();
  });
});
