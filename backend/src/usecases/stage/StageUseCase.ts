import type { Stage, Prisma } from '@prisma/client';
import type { PrismaGenericRepository } from '../../infrastructure/repositories/PrismaGenericRepository.js';
import type { CreateStageDTO, UpdateStageDTO } from '../../presentation/dtos/StageDTO.js';

export class StageUseCase {
  constructor(private stageRepository: PrismaGenericRepository<Stage, Prisma.StageDelegate>) {}

  async createStage(dto: CreateStageDTO) {
    if (!dto.tenantId || !dto.name) {
      throw new Error('Missing required fields: tenantId or name');
    }

    const entityType = dto.entityType || 'lead';

    // Enforce uniqueness of default per entityType per tenant
    if (dto.isDefaultStage) {
      await (this.stageRepository.delegate as any).updateMany({
        where: { tenantId: dto.tenantId, entityType: entityType, isDefaultStage: true },
        data: { isDefaultStage: false },
      });
    }

    // Enforce uniqueness of terminal stage per entityType per tenant
    if (dto.isTerminalStage) {
      await (this.stageRepository.delegate as any).updateMany({
        where: { tenantId: dto.tenantId, entityType: entityType, isTerminalStage: true },
        data: { isTerminalStage: false },
      });
    }

    const data: Prisma.StageCreateInput = {
      tenant: { connect: { id: dto.tenantId } },
      name: dto.name,
      position: dto.position ?? 0,
      entityType: entityType,
      isDefaultStage: dto.isDefaultStage ?? false,
      isTerminalStage: dto.isTerminalStage ?? false,
    };

    if (dto.color !== undefined) {
      data.color = dto.color;
    }

    return this.stageRepository.create(data);
  }

  async getStage(id: string, tenantId: string) {
    const stage = await this.stageRepository.findOne({ id, tenantId });
    if (!stage) {
      throw new Error('Stage not found');
    }
    return stage;
  }

  async getAllStages(tenantId: string, filters: any = {}) {
    return this.stageRepository.findAll({
      where: {
        tenantId,
        ...filters,
      },
      orderBy: { position: 'asc' },
    });
  }

  async updateStage(id: string, tenantId: string, dto: UpdateStageDTO) {
    const stage = await this.getStage(id, tenantId);
    const entityType = dto.entityType || stage.entityType || 'lead';

    if (dto.isDefaultStage) {
      await (this.stageRepository.delegate as any).updateMany({
        where: { tenantId, entityType: entityType, isDefaultStage: true },
        data: { isDefaultStage: false },
      });
    }

    if (dto.isTerminalStage) {
      await (this.stageRepository.delegate as any).updateMany({
        where: { tenantId, entityType: entityType, isTerminalStage: true },
        data: { isTerminalStage: false },
      });
    }

    const data: Prisma.StageUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.position !== undefined) data.position = dto.position;
    if (dto.color !== undefined) data.color = dto.color;
    if (dto.entityType !== undefined) data.entityType = dto.entityType;
    if (dto.isDefaultStage !== undefined) data.isDefaultStage = dto.isDefaultStage;
    if (dto.isTerminalStage !== undefined) data.isTerminalStage = dto.isTerminalStage;

    return this.stageRepository.update(id, data);
  }

  async deleteStage(id: string, tenantId: string) {
    await this.getStage(id, tenantId);
    return this.stageRepository.delete(id);
  }
}
