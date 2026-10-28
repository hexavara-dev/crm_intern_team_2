import type { Lead, Deal, LeadActivity, Status, Stage, Prisma, PrismaClient } from '@prisma/client';
import type { PrismaGenericRepository } from '../../infrastructure/repositories/PrismaGenericRepository.js';
import type { CreateLeadDTO, UpdateLeadDTO } from '../../presentation/dtos/LeadDTO.js';

const USER_PUBLIC_FIELDS = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
};

export class LeadUseCases {
  constructor(
    private leadRepository: PrismaGenericRepository<Lead, Prisma.LeadDelegate>,
    private dealRepository: PrismaGenericRepository<Deal, Prisma.DealDelegate>,
    private leadActivityRepository?: PrismaGenericRepository<
      LeadActivity,
      Prisma.LeadActivityDelegate
    >,
    private statusRepository?: PrismaGenericRepository<Status, Prisma.StatusDelegate>,
    private stageRepository?: PrismaGenericRepository<Stage, Prisma.StageDelegate>,
    private customerRepository?: PrismaGenericRepository<any, any>,
    private auditLogRepository?: PrismaGenericRepository<any, any>,
    private prisma?: PrismaClient
  ) {}

  private async validateRelations(
    dto: CreateLeadDTO | UpdateLeadDTO,
    tenantId: string
  ) {
    if (!this.prisma) return;

    const [assignedUser, sourceUser, stage, status, source, location] = await Promise.all([
      dto.assignedUserId
        ? this.prisma.user.findFirst({ where: { id: dto.assignedUserId, tenantId }, select: { id: true } })
        : undefined,
      'sourceUserId' in dto && dto.sourceUserId
        ? this.prisma.user.findFirst({ where: { id: dto.sourceUserId, tenantId }, select: { id: true } })
        : undefined,
      'stageId' in dto && dto.stageId
        ? this.prisma.stage.findFirst({
            where: { id: dto.stageId, tenantId, entityType: 'lead' },
            select: { id: true },
          })
        : undefined,
      dto.statusId
        ? this.prisma.status.findFirst({
            where: { id: dto.statusId, tenantId, type: 'lead' },
            select: { id: true },
          })
        : undefined,
      dto.sourceId
        ? this.prisma.source.findFirst({
            where: { id: dto.sourceId, tenantId, type: 'lead' },
            select: { id: true },
          })
        : undefined,
      dto.locationId
        ? this.prisma.location.findFirst({ where: { id: dto.locationId, tenantId }, select: { id: true } })
        : undefined,
    ]);

    if (dto.assignedUserId && !assignedUser) throw new Error('Assigned user not found');
    if ('sourceUserId' in dto && dto.sourceUserId && !sourceUser) {
      throw new Error('Source user not found');
    }
    if ('stageId' in dto && dto.stageId && !stage) throw new Error('Stage not found');
    if (dto.statusId && !status) throw new Error('Status not found');
    if (dto.sourceId && !source) throw new Error('Source not found');
    if (dto.locationId && !location) throw new Error('Location not found');
  }

  private async logAudit(params: {
    tenantId: string;
    entityId: string;
    entityType: string;
    actorId: string | undefined;
    action: string;
    changes?: any;
  }) {
    if (!this.auditLogRepository) return;
    try {
      await this.auditLogRepository.create({
        tenant: { connect: { id: params.tenantId } },
        entityId: params.entityId,
        entityType: params.entityType,
        actor: params.actorId ? { connect: { id: params.actorId } } : undefined,
        action: params.action,
        changes: params.changes,
      });
    } catch (error) {
      console.error('Audit Log Error:', error);
      // Don't throw to avoid breaking the main flow
    }
  }

  async createLead(dto: CreateLeadDTO, currentUserId?: string) {
    if (!dto.tenantId || !dto.firstName) {
      throw new Error('Missing required fields: tenantId or firstName');
    }

    await this.validateRelations(dto, dto.tenantId);

    const data: any = {
      tenant: { connect: { id: dto.tenantId } },
      type: dto.type,
      assignedUser: dto.assignedUserId
        ? { connect: { id: dto.assignedUserId } }
        : currentUserId
          ? { connect: { id: currentUserId } }
          : undefined,
      sourceUser: dto.sourceUserId ? { connect: { id: dto.sourceUserId } } : undefined,
      source: dto.sourceId ? { connect: { id: dto.sourceId } } : undefined,
      location: dto.locationId ? { connect: { id: dto.locationId } } : undefined,
      customer: {
        create: {
          tenant: { connect: { id: dto.tenantId } },
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          phoneNumber: dto.phone,
          gender: dto.gender,
          salutation: dto.salutation,
          location: dto.location,
          ...(dto.organizationName
            ? {
                organization: {
                  create: {
                    tenant: { connect: { id: dto.tenantId } },
                    name: dto.organizationName,
                    location: dto.organizationLocation,
                  },
                },
              }
            : {}),
        },
      },
      status: dto.statusId ? { connect: { id: dto.statusId } } : undefined,
      ...(dto.notes
        ? {
            activities: {
              create: {
                tenant: { connect: { id: dto.tenantId } },
                activityType: 'registration',
                notes: {
                  create: {
                    content: dto.notes,
                  },
                },
              },
            },
          }
        : {}),
    };

    return this.leadRepository.create(data);
  }

  async getLead(id: string, tenantId?: string) {
    if (!tenantId) throw new Error('Tenant context missing');
    const lead = await this.leadRepository.findOne({ id, tenantId, isDeleted: false }, {
      customer: {
        include: {
          organization: true,
        },
      },
      status: true,
      stage: true,
      activities: {
        include: {
          notes: true,
          tasks: {
            include: {
              assignedUser: { select: USER_PUBLIC_FIELDS },
            },
          },
          callLogs: true,
          actor: { select: USER_PUBLIC_FIELDS },
        },
      },
      attachments: true,
      location: true,
      assignedUser: { select: USER_PUBLIC_FIELDS },
      sourceUser: { select: USER_PUBLIC_FIELDS },
      source: true,
      viewings: {
        select: {
          id: true,
          status: true,
          scheduledAt: true,
          location: true,
        },
      },
    });
    if (!lead) {
      throw new Error('Lead not found');
    }
    return lead;
  }

  async updateLead(id: string, dto: UpdateLeadDTO, role: string, currentUserId?: string, tenantId?: string) {
    if (role !== 'owner') {
      delete dto.assignedUserId;
    }

    const lead: any = await this.getLead(id, tenantId);

    if (!tenantId) throw new Error('Tenant context missing');
    await this.validateRelations(dto, tenantId);

    const updateData: any = {};
    const auditChanges: any = {};

    if (dto.statusId) {
      updateData.status = { connect: { id: dto.statusId } };
      auditChanges.statusId = { old: lead.statusId, new: dto.statusId };
    }
    if (dto.assignedUserId) {
      updateData.assignedUser = { connect: { id: dto.assignedUserId } };
      auditChanges.assignedUserId = { old: lead.assignedUserId, new: dto.assignedUserId };
    } else if (dto.assignedUserId === '') {
      updateData.assignedUser = { disconnect: true };
      auditChanges.assignedUserId = { old: lead.assignedUserId, new: null };
    }

    if (dto.stageId) {
      updateData.stage = { connect: { id: dto.stageId } };
      auditChanges.stageId = { old: lead.stageId, new: dto.stageId };
    }

    if (dto.locationId) {
      updateData.location = { connect: { id: dto.locationId } };
      auditChanges.locationId = { old: lead.locationId, new: dto.locationId };
    }

    if (dto.type) {
      updateData.type = dto.type;
    }
    if (dto.converted !== undefined) {
      updateData.converted = dto.converted;
    }
    if (dto.convertedDate) {
      updateData.convertedDate = dto.convertedDate;
    }

    if (dto.sourceId) {
      updateData.source = { connect: { id: dto.sourceId } };
    } else if (dto.sourceId === '') {
      updateData.source = { disconnect: true };
    }

    const customerData: any = {};
    if (dto.firstName) customerData.firstName = dto.firstName;
    if (dto.lastName !== undefined) customerData.lastName = dto.lastName;
    if (dto.email !== undefined) customerData.email = dto.email;
    if (dto.phone !== undefined) customerData.phoneNumber = dto.phone;
    if (dto.gender !== undefined) customerData.gender = dto.gender;
    if (dto.salutation !== undefined) customerData.salutation = dto.salutation;
    if (dto.location !== undefined) customerData.location = dto.location;

    if (dto.organizationName || dto.organizationLocation) {
      if (lead.customer.organizationId) {
        customerData.organization = {
          update: {
            ...(dto.organizationName && { name: dto.organizationName }),
            ...(dto.organizationLocation && { location: dto.organizationLocation }),
          },
        };
      } else {
        customerData.organization = {
          create: {
            tenant: { connect: { id: lead.tenantId } },
            name: dto.organizationName || 'Unknown',
            location: dto.organizationLocation,
          },
        };
      }
    }

    if (Object.keys(customerData).length > 0 && this.customerRepository) {
      await this.customerRepository.update(lead.customerId, customerData);
    }

    const updatedLead = await this.leadRepository.update(id, updateData);

    if (Object.keys(auditChanges).length > 0) {
      await this.logAudit({
        tenantId: lead.tenantId,
        entityId: id,
        entityType: 'lead',
        actorId: currentUserId,
        action: 'update',
        changes: auditChanges,
      });
    }

    return updatedLead;
  }

  async deleteLead(id: string, tenantId?: string) {
    await this.getLead(id, tenantId);
    return this.leadRepository.update(id, { isDeleted: true });
  }

  async getAllLeads(
    tenantId: string,
    page: number = 1,
    limit: number = 10,
    filters: any = {},
    search?: string
  ) {
    const skip = (page - 1) * limit;
    const take = limit;
    const where: Prisma.LeadWhereInput = {
      ...filters,
      tenantId,
      isDeleted: false,
      ...(search
        ? {
            OR: [
              { customer: { is: { firstName: { contains: search } } } },
              { customer: { is: { lastName: { contains: search } } } },
              { customer: { is: { email: { contains: search } } } },
              { customer: { is: { phoneNumber: { contains: search } } } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.leadRepository.findAll({
        where,
        skip,
        take,
        include: {
          customer: {
            include: {
              organization: true,
            },
          },
          status: true,
          stage: true,
          location: true,
          assignedUser: { select: USER_PUBLIC_FIELDS },
          sourceUser: { select: USER_PUBLIC_FIELDS },
          source: true,
          viewings: {
            select: {
              id: true,
              status: true,
              scheduledAt: true,
              location: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.leadRepository.count(where),
    ]);

    const mappedData = data.map((lead: any) => {
      const { viewings, ...leadData } = lead;
      return {
        ...leadData,
        viewing: viewings && viewings.length > 0 ? viewings[0] : null,
      };
    });

    return {
      data: mappedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async convertLeadToDeal(id: string, dealData: any, tenantId?: string) {
    const lead = await this.getLead(id, tenantId);

    if (lead.converted) {
      throw new Error('Lead already converted');
    }

    const dealPayload = {
      tenant: { connect: { id: lead.tenantId } },
      lead: { connect: { id: lead.id } },
      dealType: lead.type,
      expectedAmount: dealData.expectedAmount || 0,
      currency: dealData.currency || 'USD',
      refCode: `DEAL-${Date.now()}`,
      closingDate: new Date(),
    };

    if (this.prisma) {
      return this.prisma.$transaction(async (tx) => {
        const updated = await tx.lead.updateMany({
          where: { id, tenantId: lead.tenantId, converted: false, isDeleted: false },
          data: { converted: true, convertedDate: new Date() },
        });
        if (updated.count !== 1) throw new Error('Lead already converted');

        const deal = await tx.deal.create({ data: dealPayload });

        if (this.leadActivityRepository) {
          await tx.leadActivity.create({
            data: {
              tenant: { connect: { id: lead.tenantId } },
              lead: { connect: { id: lead.id } },
              activityType: 'conversion',
              notes: { create: { content: `Lead converted to deal: ${deal.refCode}` } },
            },
          });
        }

        return deal;
      });
    }

    await this.leadRepository.update(id, {
      converted: true,
      convertedDate: new Date(),
    });

    const deal = await this.dealRepository.create(dealPayload);

    // 3. Add activity for lead conversion
    if (this.leadActivityRepository) {
      await this.leadActivityRepository.create({
        tenant: { connect: { id: lead.tenantId } },
        lead: { connect: { id: lead.id } },
        activityType: 'conversion',
        notes: {
          create: {
            content: `Lead converted to deal: ${deal.refCode}`,
          },
        },
      });
    }

    return deal;
  }

  async setStatus(id: string, statusName: string, tenantId: string) {
    if (!this.statusRepository) {
      throw new Error('Status repository not initialized');
    }

    const status = await this.statusRepository.findOne({
      tenantId: tenantId,
      name: statusName,
    });

    if (!status) {
      throw new Error(
        `Status "${statusName}" not found in your organization. Please create it first in the Statuses configuration.`
      );
    }

    await this.getLead(id, tenantId);

    return this.leadRepository.update(id, {
      statusId: status.id,
    });
  }

  async setStage(id: string, stageName: string, tenantId: string) {
    if (!this.stageRepository) {
      throw new Error('Stage repository not initialized');
    }

    const stage = await this.stageRepository.findOne({
      tenantId: tenantId,
      name: stageName,
    });

    if (!stage) {
      throw new Error(
        `Stage "${stageName}" not found in your organization. Please create it first in the Stages configuration.`
      );
    }

    await this.getLead(id, tenantId);

    return this.leadRepository.update(id, {
      stageId: stage.id,
    });
  }

  async logActivity(
    leadId: string,
    activityType: string,
    actorId?: string,
    details?: {
      notes?: string;
      task?: {
        title: string;
        description?: string;
        dueDate?: Date;
        priority?: string;
        assignedUserId?: string;
      };
      call?: {
        title?: string;
        description?: string;
        duration?: number;
        callingNumber?: string;
        receivingNumber?: string;
      };
    }
  ) {
    if (!this.leadActivityRepository) {
      throw new Error('Lead activity repository not initialized');
    }

    const lead = await this.leadRepository.findById(leadId);
    if (!lead) throw new Error('Lead not found');

    const activityData: any = {
      tenant: { connect: { id: lead.tenantId } },
      lead: { connect: { id: lead.id } },
      customer: { connect: { id: lead.customerId } },
      activityType,
      actor: actorId ? { connect: { id: actorId } } : undefined,
    };

    if (details?.notes) {
      activityData.notes = {
        create: {
          content: details.notes,
        },
      };
    }

    if (details?.task) {
      activityData.tasks = {
        create: {
          title: details.task.title,
          description: details.task.description,
          dueDate: details.task.dueDate,
          priority: details.task.priority || 'normal',
          assignedUser: details.task.assignedUserId
            ? { connect: { id: details.task.assignedUserId } }
            : undefined,
        },
      };
    }

    if (details?.call) {
      activityData.callLogs = {
        create: {
          title: details.call.title,
          description: details.call.description,
          duration: details.call.duration,
          callingNumber: details.call.callingNumber,
          receivingNumber: details.call.receivingNumber,
        },
      };
    }

    return this.leadActivityRepository.create(activityData);
  }
}
