import type { Status, Prisma } from '@prisma/client';
import type { PrismaGenericRepository } from '../../infrastructure/repositories/PrismaGenericRepository.js';
import type { CreateStatusDTO, UpdateStatusDTO } from '../../presentation/dtos/StatusDTO.js';

export class StatusUseCase {
  constructor(private statusRepository: PrismaGenericRepository<Status, Prisma.StatusDelegate>) {}

  async createStatus(dto: CreateStatusDTO) {
    if (!dto.tenantId || !dto.name) {
      throw new Error('Missing required fields: tenantId or name');
    }

    const type = dto.type || 'lead';

    // Enforce uniqueness of default per type per tenant
    if (dto.isDefaultStatus) {
      await (this.statusRepository.delegate as any).updateMany({
        where: { tenantId: dto.tenantId, type: type, isDefaultStatus: true },
        data: { isDefaultStatus: false },
      });
    }

    // Enforce uniqueness of closing status per type per tenant
    if (dto.isClosingStatus) {
      await (this.statusRepository.delegate as any).updateMany({
        where: { tenantId: dto.tenantId, type: type, isClosingStatus: true },
        data: { isClosingStatus: false },
      });
    }

    const data: Prisma.StatusCreateInput = {
      tenant: { connect: { id: dto.tenantId } },
      name: dto.name,
      priority: dto.priority ?? 0,
      type: type,
      isDefaultStatus: dto.isDefaultStatus ?? false,
      isClosingStatus: dto.isClosingStatus ?? false,
    };

    if (dto.color !== undefined) {
      data.color = dto.color;
    }

    return this.statusRepository.create(data);
  }

  async getStatus(id: string, tenantId: string) {
    const status = await this.statusRepository.findOne({ id, tenantId });
    if (!status) {
      throw new Error('Status not found');
    }
    return status;
  }

  async getAllStatuses(tenantId: string, filters: any = {}) {
    return this.statusRepository.findAll({
      where: {
        tenantId,
        ...filters,
      },
      orderBy: { priority: 'asc' },
    });
  }

  async updateStatus(id: string, tenantId: string, dto: UpdateStatusDTO) {
    const status = await this.getStatus(id, tenantId);
    if (status.isSystemStatus) {
      throw new Error('Cannot update a system default status');
    }
    const type = dto.type || status.type || 'lead';

    if (dto.isDefaultStatus) {
      await (this.statusRepository.delegate as any).updateMany({
        where: { tenantId, type: type, isDefaultStatus: true },
        data: { isDefaultStatus: false },
      });
    }

    if (dto.isClosingStatus) {
      await (this.statusRepository.delegate as any).updateMany({
        where: { tenantId, type: type, isClosingStatus: true },
        data: { isClosingStatus: false },
      });
    }

    const data: Prisma.StatusUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.color !== undefined) data.color = dto.color;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.isDefaultStatus !== undefined) data.isDefaultStatus = dto.isDefaultStatus;
    if (dto.isClosingStatus !== undefined) data.isClosingStatus = dto.isClosingStatus;

    return this.statusRepository.update(id, data);
  }

  async deleteStatus(id: string, tenantId: string) {
    const status = await this.getStatus(id, tenantId);
    if (status.isSystemStatus) {
      throw new Error('Cannot delete a system default status');
    }
    return this.statusRepository.delete(id);
  }
}
