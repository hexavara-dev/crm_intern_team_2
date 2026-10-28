import { LeadUseCases } from '../../src/usecases/lead/LeadUseCases.js';
import type { IRepository } from '../../src/domain/repositories/IRepository.js';

class MockLeadRepository implements IRepository<any> {
  private db: Record<string, any> = {};

  async create(data: any) {
    const id = 'mock-' + Math.random().toString(36).substr(2, 9);
    const newRecord = { id, isDeleted: false, ...data };
    this.db[id] = newRecord;
    return newRecord;
  }

  async findById(id: string) {
    return this.db[id] || null;
  }

  async findOne(where: any) {
    return (
      Object.values(this.db).find((record) => {
        return Object.entries(where).every(([key, value]) => record[key] === value);
      }) || null
    );
  }

  async update(id: string, data: any) {
    if (!this.db[id]) throw new Error('Not found');
    this.db[id] = { ...this.db[id], ...data };
    return this.db[id];
  }

  async delete(id: string) {
    if (!this.db[id]) throw new Error('Not found');
    const element = this.db[id];
    delete this.db[id];
    return element;
  }

  async findAll(include?: any, where?: any) {
    return Object.values(this.db);
  }

  async count() {
    return Object.keys(this.db).length;
  }
}

describe('LeadUseCases', () => {
  let mockRepo: MockLeadRepository;
  let leadUseCases: LeadUseCases;

  beforeEach(() => {
    mockRepo = new MockLeadRepository();
    leadUseCases = new LeadUseCases(mockRepo, mockRepo);
  });

  it('should create a lead successfully if required data is provided', async () => {
    const result = await leadUseCases.createLead({
      tenantId: 'tenant-1',
      firstName: 'John',
    });

    expect(result).toHaveProperty('id');
    // Result structure depends on create implementation which builds a complex Prisma object
    // But since it's a mock, it just returns what we passed + id
  });

  it('should throw error when missing tenantId or firstName', async () => {
    await expect(leadUseCases.createLead({ lastName: 'Doe' } as any)).rejects.toThrow();
  });

  it('should get a lead by id', async () => {
    const created = await mockRepo.create({ data: 'test', tenantId: 'tenant-1' });
    const lead = await leadUseCases.getLead(created.id, 'tenant-1');
    expect(lead).toBeDefined();
  });

  it('should get all leads', async () => {
    await mockRepo.create({ name: 'Lead 1' });
    await mockRepo.create({ name: 'Lead 2' });

    const leads = await leadUseCases.getAllLeads('tenant-1');
    expect(leads.data).toHaveLength(2);
  });
});
