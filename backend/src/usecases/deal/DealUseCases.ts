import type { Prisma, PrismaClient } from '@prisma/client';
import type { IRepository } from '../../domain/repositories/IRepository.js';
import type { CreateDealDTO, UpdateDealDTO } from '../../presentation/dtos/DealDTO.js';

export class DealUseCases {
  constructor(
    private dealRepository: IRepository<any>,
    private dealActivityRepository?: IRepository<any>,
    private leadRepository?: IRepository<any>,
    private userRepository?: IRepository<any>,
    private stageRepository?: IRepository<any>,
    private statusRepository?: IRepository<any>,
    private prisma?: PrismaClient
  ) {}

  private async validateRelations(dto: CreateDealDTO | UpdateDealDTO, tenantId: string) {
    const [lead, assignedUser, stage, status] = await Promise.all([
      dto.leadId && this.leadRepository
        ? this.leadRepository.findOne({ id: dto.leadId, tenantId, isDeleted: false })
        : undefined,
      dto.assignedUserId && this.userRepository
        ? this.userRepository.findOne({ id: dto.assignedUserId, tenantId })
        : undefined,
      dto.stageId && this.stageRepository
        ? this.stageRepository.findOne({ id: dto.stageId, tenantId, entityType: 'deal' })
        : undefined,
      dto.statusId && this.statusRepository
        ? this.statusRepository.findOne({ id: dto.statusId, tenantId, type: 'deal' })
        : undefined,
    ]);

    if (dto.leadId && this.leadRepository && !lead) throw new Error('Lead not found');
    if (dto.assignedUserId && this.userRepository && !assignedUser) {
      throw new Error('Assigned user not found');
    }
    if (dto.stageId && this.stageRepository && !stage) throw new Error('Stage not found');
    if (dto.statusId && this.statusRepository && !status) throw new Error('Status not found');
  }

  async createDeal(dto: CreateDealDTO) {
    if (!dto.tenantId) {
      throw new Error('TenantId is required to create a deal');
    }

    await this.validateRelations(dto, dto.tenantId);

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

    if (this.prisma) {
      return this.prisma.$transaction(async (tx) => {
        const deal = await tx.deal.create({ data });

        if (this.dealActivityRepository) {
          await tx.dealActivity.create({
            data: {
              tenant: { connect: { id: dto.tenantId } },
              deal: { connect: { id: deal.id } },
              activityType: 'deal_created',
              notes: {
                create: {
                  content: `Deal created: ${deal.refCode}`,
                },
              },
            },
          });
        }

        return deal;
      });
    }

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

  async getDeal(id: string, tenantId?: string) {
    if (!tenantId) throw new Error('Tenant context missing');
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
        assignedUser: {
          select: { id: true, tenantId: true, email: true, name: true, role: true, createdAt: true },
        },
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
    if (deal.tenantId !== tenantId) throw new Error('Deal not found');
    return deal;
  }

  async getAllDeals(
    tenantId: string,
    page: number = 1,
    limit: number = 10,
    filters: any = {},
    search?: string
  ) {
    const skip = (page - 1) * limit;
    const take = limit;
    const where: Prisma.DealWhereInput = {
      ...filters,
      tenantId,
      ...(search
        ? {
            OR: [
              { refCode: { contains: search } },
              { dealType: { contains: search } },
              {
                lead: {
                  is: { customer: { is: { firstName: { contains: search } } } },
                },
              },
              {
                lead: {
                  is: { customer: { is: { lastName: { contains: search } } } },
                },
              },
            ],
          }
        : {}),
    };

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

  async updateDeal(id: string, dto: UpdateDealDTO, tenantId?: string) {
    await this.getDeal(id, tenantId);

    if (!tenantId) throw new Error('Tenant context missing');

    await this.validateRelations(dto, tenantId);

    const data: Prisma.DealUncheckedUpdateInput = {};
    const assignIfDefined = <K extends keyof UpdateDealDTO>(key: K) => {
      if (dto[key] !== undefined) {
        (data as any)[key] = dto[key];
      }
    };

    assignIfDefined('amount');
    assignIfDefined('leadId');
    assignIfDefined('assignedUserId');
    assignIfDefined('stageId');
    assignIfDefined('statusId');
    assignIfDefined('dealType');
    assignIfDefined('expectedAmount');
    assignIfDefined('currency');
    assignIfDefined('expectedClosingDate');
    assignIfDefined('closingDate');
    assignIfDefined('lostReason');
    assignIfDefined('lostNotes');

    return this.dealRepository.update(id, data);
  }

  async deleteDeal(id: string, tenantId?: string) {
    await this.getDeal(id, tenantId);
    return this.dealRepository.delete(id);
  }
}
