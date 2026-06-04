import type { Prisma } from '@prisma/client';
import type { IRepository } from '../../domain/repositories/IRepository.js';
import type { CreateDealDTO, UpdateDealDTO } from '../../presentation/dtos/DealDTO.js';

export class DealUseCases {
  constructor(
    private dealRepository: IRepository<any>,
    private dealActivityRepository?: IRepository<any>
  ) {}

  async createDeal(dto: CreateDealDTO) {
    if (!dto.tenantId) {
      throw new Error('TenantId is required to create a deal');
    }

    const data: any = {
      tenant: { connect: { id: dto.tenantId } },
      lead: dto.leadId ? { connect: { id: dto.leadId } } : undefined,
      assignedUser: dto.assignedUserId ? { connect: { id: dto.assignedUserId } } : undefined,
      stage: dto.stageId ? { connect: { id: dto.stageId } } : undefined,
      status: dto.statusId ? { connect: { id: dto.statusId } } : undefined,
      refCode: dto.refCode,
      dealType: dto.dealType,
      expectedAmount: dto.expectedAmount,
      currency: dto.currency || 'USD',
      expectedClosingDate: dto.expectedClosingDate,
    };

    const deal = await this.dealRepository.create(data);

    // Add activity for deal creation
    if (this.dealActivityRepository) {
      await this.dealActivityRepository.create({
        tenant: { connect: { id: dto.tenantId } },
        deal: { connect: { id: deal.id } },
        activityType: 'deal_created',
        notes: {
          create: {
            content: `Deal created: ${deal.refCode}`,
          },
        },
      });
    }

    return deal;
  }

  async getDeal(id: string) {
    const deal = await (this.dealRepository as any).delegate.findUnique({
      where: { id },
      include: {
        lead: {
          include: {
            customer: {
              include: {
                organization: true,
              },
            },
          },
        },
        stage: true,
        status: true,
        assignedUser: true,
        activities: {
          include: {
            notes: true,
            tasks: true,
            callLogs: true,
          },
        },
        attachments: true,
      },
    });
    if (!deal) {
      throw new Error('Deal not found');
    }
    return deal;
  }

  async getAllDeals(tenantId: string, page: number = 1, limit: number = 10, filters: any = {}) {
    const skip = (page - 1) * limit;
    const take = limit;
    const where = { tenantId, ...filters };

    const [data, total] = await Promise.all([
      (this.dealRepository as any).delegate.findMany({
        where,
        skip,
        take,
        include: {
          lead: {
            include: {
              customer: {
                include: {
                  organization: true,
                },
              },
            },
          },
          stage: true,
          status: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.dealRepository.count(where),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateDeal(id: string, dto: UpdateDealDTO) {
    const data: Prisma.DealUpdateInput = {
      amount: dto.amount ?? 0,
    };

    return this.dealRepository.update(id, data);
  }

  async deleteDeal(id: string) {
    return this.dealRepository.delete(id);
  }
}
