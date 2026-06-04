import type { Request, Response } from 'express';
import { AuthUseCases } from '../../usecases/auth/AuthUseCases.js';
import { mapPrismaError } from '../../infrastructure/utils/PrismaErrorMapper.js';

export class AuthController {
  constructor(private authUseCases: AuthUseCases) {}

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await this.authUseCases.login(email, password);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(401).json({ error: mapPrismaError(error) });
    }
  }

  async register(req: Request, res: Response) {
    try {
      const { password, name, email, tenantId } = req.body;
      const result = await this.authUseCases.register(password, name, email, tenantId);
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: mapPrismaError(error) });
    }
  }

  async onboard(req: Request, res: Response) {
    try {
      const { tenantName, email, password, name } = req.body;
      const result = await this.authUseCases.onboard(tenantName, email, password, name);
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: mapPrismaError(error) });
    }
  }

  async getMe(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) throw new Error('Unauthenticated');
      const result = await this.authUseCases.getMe(userId);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(401).json({ error: mapPrismaError(error) });
    }
  }

  async updateAccount(req: Request, res: Response) {
    try {
      const { userId: targetUserId, ...data } = req.body;
      const requesterRole = (req as any).user?.role;
      const result = await this.authUseCases.updateAccount(requesterRole, targetUserId, data);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: mapPrismaError(error) });
    }
  }
}
