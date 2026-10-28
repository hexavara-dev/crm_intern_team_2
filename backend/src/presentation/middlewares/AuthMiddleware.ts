import type { Request, Response, NextFunction } from 'express';
import type { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { prisma } from '../../infrastructure/database/prisma.js';

export const createAuthMiddleware = (prismaClient: PrismaClient) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) return next(new Error('Missing JWT_SECRET environment variable'));
  const cookieHeader = req.headers.cookie;
  const encodedCookieToken = cookieHeader
    ?.split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith('accessToken='))
    ?.slice('accessToken='.length);
  let cookieToken: string | undefined;
  if (encodedCookieToken) {
    try {
      cookieToken = decodeURIComponent(encodedCookieToken);
    } catch {
      return res.status(401).json({ error: 'Unauthorized. Invalid access token.' });
    }
  }
  let accessToken = cookieToken || req.headers.authorization;

  if (!accessToken) {
    return res.status(401).json({ error: 'Unauthorized. Access token not provided' });
  }

  while (accessToken.toLowerCase().startsWith('bearer ')) {
    accessToken = accessToken.substring(7).trim();
  }

  accessToken = accessToken.replace(/^"|"$/g, '').replace(/^'|'$/g, '');

  let decodedAccessToken: jwt.JwtPayload;
  try {
    const decoded = jwt.verify(accessToken, jwtSecret);
    if (
      typeof decoded !== 'object' ||
      typeof decoded.userId !== 'string' ||
      typeof decoded.tenantId !== 'string'
    ) throw new Error('Invalid token payload');
    decodedAccessToken = decoded;
  } catch {
    return res.status(401).json({ error: 'Unauthorized. Invalid access token.' });
  }

  try {
    const user = await prismaClient.user.findFirst({
      where: { id: decodedAccessToken.userId, tenantId: decodedAccessToken.tenantId },
      select: { id: true, tenantId: true, role: true },
    });
    if (!user) return res.status(401).json({ error: 'Unauthorized. Invalid access token.' });

    (req as any).user = { userId: user.id, tenantId: user.tenantId, role: user.role };
    return next();
  } catch (error) {
    return next(error);
  }
};

export const authMiddleware = createAuthMiddleware(prisma);

export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if ((req as any).user.role !== role) {
      return res.status(403).json({ error: 'Forbidden. Insufficient permissions' });
    }
    next();
  };
};
