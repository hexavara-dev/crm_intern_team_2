import type { Request, Response } from 'express';
import { GenericUseCases } from '../../usecases/GenericUseCases.js';
import { respondWithError } from '../../infrastructure/utils/HttpErrorMapper.js';

export class GenericController {
  constructor(
    private useCases: GenericUseCases,
    private include?: any
  ) {}

  async create(req: Request, res: Response) {
    try {
      const result = await this.useCases.create(req, req.body);
      return res.status(201).json(result);
    } catch (error: any) {
      return respondWithError(res, error);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const result = await this.useCases.getById(req, req.params.id as string, this.include);
      return res.status(200).json(result);
    } catch (error: any) {
      return respondWithError(res, error);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const result = await this.useCases.update(req, req.params.id as string, req.body);
      return res.status(200).json(result);
    } catch (error: any) {
      return respondWithError(res, error);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const result = await this.useCases.delete(req, req.params.id as string);
      return res.status(200).json(result);
    } catch (error: any) {
      return respondWithError(res, error);
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const result = await this.useCases.getAll(req, this.include);
      return res.status(200).json(result);
    } catch (error: any) {
      return respondWithError(res, error);
    }
  }
}
