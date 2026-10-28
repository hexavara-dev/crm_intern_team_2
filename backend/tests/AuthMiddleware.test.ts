import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';
import { createAuthMiddleware } from '../src/presentation/middlewares/AuthMiddleware.js';

function responseMock() {
  const response: any = {};
  response.status = jest.fn().mockReturnValue(response);
  response.json = jest.fn().mockReturnValue(response);
  return response as Response;
}

describe('authMiddleware database verification', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-only-jwt-secret';
  });

  it('uses the current database role instead of the stale JWT role', async () => {
    const token = jwt.sign(
      { userId: 'user-1', tenantId: 'tenant-1', role: 'owner' },
      process.env.JWT_SECRET!
    );
    const prisma = {
      user: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'user-1',
          tenantId: 'tenant-1',
          role: 'member',
        }),
      },
    };
    const request = { headers: { authorization: `Bearer ${token}` } } as Request;
    const next = jest.fn();

    await createAuthMiddleware(prisma as never)(request, responseMock(), next);

    expect((request as any).user).toEqual({
      userId: 'user-1',
      tenantId: 'tenant-1',
      role: 'member',
    });
    expect(next).toHaveBeenCalledWith();
  });

  it('rejects a valid token after its user has been deleted', async () => {
    const token = jwt.sign(
      { userId: 'user-1', tenantId: 'tenant-1', role: 'member' },
      process.env.JWT_SECRET!
    );
    const prisma = { user: { findFirst: jest.fn().mockResolvedValue(null) } };
    const request = { headers: { authorization: `Bearer ${token}` } } as Request;
    const response = responseMock();
    const next = jest.fn();

    await createAuthMiddleware(prisma as never)(request, response, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
