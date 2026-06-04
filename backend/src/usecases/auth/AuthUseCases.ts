import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { IRepository } from '../../domain/repositories/IRepository.js';

export class AuthUseCases {
  private jwtSecret = process.env.JWT_SECRET || 'supersecret';

  constructor(
    private userRepository: IRepository<any>,
    private inviteRepository: IRepository<any>,
    private tenantRepository?: IRepository<any>,
    private statusRepository?: IRepository<any>
  ) {}

  async onboard(tenantName: string, email: string, password: string, name?: string) {
    if (!this.tenantRepository) throw new Error('Tenant repository not configured');

    const existing = await this.userRepository.findOne({ email });
    if (existing) throw new Error('Email already registered');

    const hashedPassword = await bcrypt.hash(password, 10);

    const newTenant: any = await this.tenantRepository.create({
      name: tenantName,
      plan: 'free',
    });

    const newUser: any = await this.userRepository.create({
      tenant: { connect: { id: newTenant.id } },
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
      role: 'owner',
    });

    if (this.statusRepository) {
      const defaultStatuses = [
        {
          name: 'direncanakan',
          type: 'viewing',
          isDefaultStatus: true,
          isSystemStatus: true,
          priority: 1,
        },
        { name: 'belum dikerjakan', type: 'viewing', isSystemStatus: true, priority: 2 },
        { name: 'perlu reschedule', type: 'viewing', isSystemStatus: true, priority: 3 },
        {
          name: 'sudah visit',
          type: 'viewing',
          isClosingStatus: true,
          isSystemStatus: true,
          priority: 4,
        },
        { name: 'gagal', type: 'viewing', isFailedStatus: true, isSystemStatus: true, priority: 5 },
      ];

      for (const status of defaultStatuses) {
        await this.statusRepository.create({
          tenant: { connect: { id: newTenant.id } },
          ...status,
        });
      }
    }

    const token = jwt.sign(
      { userId: newUser.id, tenantId: newUser.tenantId, role: newUser.role },
      this.jwtSecret,
      { expiresIn: '1d' }
    );

    return { token, user: newUser, tenant: newTenant };
  }

  async createInvite(
    hostUserId: string,
    tenantId: string,
    email: string,
    role: string = 'member',
    name?: string
  ) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return this.inviteRepository.create({
      tenant: { connect: { id: tenantId } },
      hostUser: { connect: { id: hostUserId } },
      email,
      name,
      role,
      expiresAt,
    });
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({ email });
    if (!user) throw new Error('Invalid email or password');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error('Invalid email or password');

    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenantId, role: user.role },
      this.jwtSecret,
      { expiresIn: '1d' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  async register(password: string, name: string, email: string, tenantId: string) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.userRepository.create({
      password: hashedPassword,
      name: name,
      email: email,
      role: 'user',
      tenant: { connect: { id: tenantId } },
    });

    const token = jwt.sign(
      {
        userId: (newUser as any).id,
        tenantId: (newUser as any).tenantId,
        role: (newUser as any).role,
      },
      this.jwtSecret,
      { expiresIn: '1d' }
    );

    return { token, user: newUser };
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    const { ...userWithoutPassword } = user as any;
    return userWithoutPassword;
  }

  async updateAccount(requesterRole: string, targetUserId: string, data: any) {
    if (requesterRole !== 'owner') {
      throw new Error('Unauthorized: Only owners can update accounts');
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.role) updateData.role = data.role;
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await this.userRepository.update(targetUserId, updateData);
    const { ...userWithoutPassword } = updatedUser as any;
    return userWithoutPassword;
  }
}
