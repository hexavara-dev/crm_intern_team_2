import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET || 'supersecret';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  let accessToken = req.headers.authorization || (req.cookies && req.cookies['accessToken']);

  if (!accessToken) {
    return res.status(401).json({ message: 'Unauthorized. Access token not provided' });
  }

  while (accessToken.toLowerCase().startsWith('bearer ')) {
    accessToken = accessToken.substring(7).trim();
  }

  accessToken = accessToken.replace(/^"|"$/g, '').replace(/^'|'$/g, '');

  try {
    const decodedAccessToken = jwt.verify(accessToken, jwtSecret);
    (req as any).user = decodedAccessToken;
    next();
  } catch (err: any) {
    return res.status(401).json({
      message: 'Unauthorized. Invalid access token.',
      details: err.message,
      errorName: err.name,
      errorCode: err.code,
    });
  }
};

export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if ((req as any).user.role !== role) {
      return res.status(403).json({ message: 'Forbidden. Insufficient permissions' });
    }
    next();
  };
};
