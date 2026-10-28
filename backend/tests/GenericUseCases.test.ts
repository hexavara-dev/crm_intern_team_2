import type { Request } from 'express';
import type { IRepository } from '../src/domain/repositories/IRepository.js';
import { GenericUseCases } from '../src/usecases/GenericUseCases.js';

class MockRepository implements IRepository<any> {
  public items: any[] = [];

  constructor(public modelName: string) {}

  async create(data: any) {
    const item = { id: 'created-1', ...data };
    this.items.push(item);
    return item;
  }

  async findById(id: string) {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async findOne(where: any) {
    return (
      this.items.find((item) =>
        Object.entries(where).every(([key, value]) => item[key] === value)
      ) ?? null
    );
  }

  async update(id: string, data: any) {
    const item = await this.findById(id);
    if (!item) throw new Error('Not found');
    Object.assign(item, data);
    return item;
  }

  async delete(id: string) {
    const item = await this.findById(id);
    if (!item) throw new Error('Not found');
    return item;
  }

  async findAll() {
    return this.items;
  }
}

const requestForTenant = (tenantId = 'tenant-1') =>
  ({ user: { tenantId, userId: 'user-1' }, query: {} }) as unknown as Request;

describe('GenericUseCases write policies', () => {
  it('overrides browser tenantId and accepts allowed customer fields', async () => {
    const repository = new MockRepository('customer');
    const useCases = new GenericUseCases(repository);

    const result = await useCases.create(requestForTenant(), {
      tenantId: 'tenant-attacker',
      firstName: 'Ayu',
      email: 'ayu@example.com',
    });

    expect(result.tenantId).toBe('tenant-1');
    expect(result.firstName).toBe('Ayu');
  });

  it('rejects fields outside the model allowlist', async () => {
    const repository = new MockRepository('customer');
    const useCases = new GenericUseCases(repository);

    await expect(
      useCases.create(requestForTenant(), {
        firstName: 'Ayu',
        password: 'must-not-be-accepted',
      })
    ).rejects.toThrow('Unsupported field(s): password');
  });

  it('rejects direct writes for resources without a write policy', async () => {
    const repository = new MockRepository('attachment');
    const useCases = new GenericUseCases(repository);

    await expect(
      useCases.create(requestForTenant(), { fileName: 'unsafe.pdf' })
    ).rejects.toThrow('Create is not supported for this resource');

    await expect(
      useCases.delete(requestForTenant(), 'attachment-1')
    ).rejects.toThrow('Delete is not supported for this resource');
  });

  it('rejects unsupported nested activity fields', async () => {
    const repository = new MockRepository('leadActivity');
    const useCases = new GenericUseCases(repository);

    await expect(
      useCases.create(requestForTenant(), {
        leadId: 'lead-1',
        activityType: 'note',
        notes: { create: { content: 'Safe', tenantId: 'tenant-attacker' } },
      })
    ).rejects.toThrow('Unsupported notes field(s): tenantId');
  });

  it('uses JWT actor identity and adds tenant context to nested activity records', async () => {
    const repository = new MockRepository('leadActivity');
    const prisma = {
      lead: { findFirst: async () => ({ id: 'lead-1' }) },
      user: { findFirst: async () => ({ id: 'user-2' }) },
      customer: { findFirst: async () => ({ id: 'customer-1' }) },
    };
    const useCases = new GenericUseCases(repository, prisma as any);

    const result = await useCases.create(requestForTenant(), {
      leadId: 'lead-1',
      activityType: 'task',
      tasks: { create: { title: 'Follow up', assignedUserId: 'user-2' } },
    });

    expect(result.actor).toEqual({ connect: { id: 'user-1' } });
    expect(result.tasks.create.tenantId).toBe('tenant-1');
    expect(result.tenant).toEqual({ connect: { id: 'tenant-1' } });
  });

  it('rejects browser-supplied actor identity', async () => {
    const repository = new MockRepository('leadActivity');
    const useCases = new GenericUseCases(repository);

    await expect(
      useCases.create(requestForTenant(), {
        leadId: 'lead-1',
        actorId: 'user-attacker',
        activityType: 'note',
      })
    ).rejects.toThrow('Unsupported field(s): actorId');
  });

  it('rejects a customer organization outside the authenticated tenant', async () => {
    const repository = new MockRepository('customer');
    const prisma = {
      organization: { findFirst: async () => null },
    };
    const useCases = new GenericUseCases(repository, prisma as any);

    await expect(
      useCases.create(requestForTenant(), {
        firstName: 'Ayu',
        organizationId: 'organization-from-another-tenant',
      })
    ).rejects.toThrow('Organization not found');

    expect(repository.items).toHaveLength(0);
  });

  it('validates organization ownership when updating a customer', async () => {
    const repository = new MockRepository('customer');
    repository.items.push({ id: 'customer-1', tenantId: 'tenant-1', firstName: 'Ayu' });
    const prisma = {
      organization: { findFirst: async () => null },
    };
    const useCases = new GenericUseCases(repository, prisma as any);

    await expect(
      useCases.update(requestForTenant(), 'customer-1', {
        organizationId: 'organization-from-another-tenant',
      })
    ).rejects.toThrow('Organization not found');

    expect(repository.items[0].organizationId).toBeUndefined();
  });

  it('rejects cross-tenant inventory relations', async () => {
    const repository = new MockRepository('leadItem');
    const prisma = {
      lead: { findFirst: async () => ({ id: 'lead-1' }) },
      item: { findFirst: async () => null },
      inventorySlot: { findFirst: async () => ({ id: 'slot-1' }) },
    };
    const useCases = new GenericUseCases(repository, prisma as any);

    await expect(
      useCases.create(requestForTenant(), {
        leadId: 'lead-1',
        itemId: 'item-from-another-tenant',
        slotId: 'slot-1',
        quantity: 1,
      })
    ).rejects.toThrow('Item not found');
    expect(repository.items).toHaveLength(0);
  });

  it('uses JWT user identity for inventory operations', async () => {
    const repository = new MockRepository('operation');
    const useCases = new GenericUseCases(repository);

    const result = await useCases.create(requestForTenant(), {
      operationType: 'adjustment',
      notes: 'Stock count',
    });
    expect(result.userId).toBe('user-1');
    expect(result.tenantId).toBe('tenant-1');

    await expect(
      useCases.create(requestForTenant(), {
        userId: 'user-attacker',
        operationType: 'adjustment',
      })
    ).rejects.toThrow('Unsupported field(s): userId');
  });
});
