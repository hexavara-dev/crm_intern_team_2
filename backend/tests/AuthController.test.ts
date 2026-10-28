import { jest } from '@jest/globals';
import type { Request, Response } from 'express';
import { AuthController } from '../src/presentation/controllers/AuthController.js';

function createResponseMock() {
  const response: any = {};
  response.cookie = jest.fn().mockReturnValue(response);
  response.clearCookie = jest.fn().mockReturnValue(response);
  response.status = jest.fn().mockReturnValue(response);
  response.json = jest.fn().mockReturnValue(response);
  response.send = jest.fn().mockReturnValue(response);
  return response as Response & {
    cookie: ReturnType<typeof jest.fn>;
    clearCookie: ReturnType<typeof jest.fn>;
    status: ReturnType<typeof jest.fn>;
    json: ReturnType<typeof jest.fn>;
  };
}

describe('AuthController cookie session', () => {
  it('sets an HttpOnly cookie and does not expose the JWT in the login response', async () => {
    const authUseCases = {
      login: jest.fn().mockResolvedValue({
        token: 'signed-jwt',
        user: { id: 'user-1', email: 'owner@example.com', role: 'owner' },
      }),
    };
    const controller = new AuthController(authUseCases as any);
    const request = {
      body: { email: 'owner@example.com', password: 'password-123' },
    } as Request;
    const response = createResponseMock();

    await controller.login(request, response);

    expect(response.cookie).toHaveBeenCalledWith(
      'accessToken',
      'signed-jwt',
      expect.objectContaining({ httpOnly: true, sameSite: 'lax', path: '/' })
    );
    expect(response.json).toHaveBeenCalledWith({
      user: { id: 'user-1', email: 'owner@example.com', role: 'owner' },
    });
  });

  it('clears the auth cookie on logout', async () => {
    const controller = new AuthController({} as any);
    const response = createResponseMock();

    await controller.logout({} as Request, response);

    expect(response.clearCookie).toHaveBeenCalledWith(
      'accessToken',
      expect.objectContaining({ httpOnly: true, sameSite: 'lax', path: '/' })
    );
    expect(response.status).toHaveBeenCalledWith(204);
  });
});
