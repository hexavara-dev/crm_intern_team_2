import { mapHttpError } from '../src/infrastructure/utils/HttpErrorMapper.js';

describe('mapHttpError', () => {
  it.each([
    [new Error('firstName is required'), 400],
    [new Error('Invalid email or password'), 401],
    [new Error('Tenant context missing'), 401],
    [new Error('Unauthorized: Only owners can update accounts'), 403],
    [new Error('Lead not found'), 404],
    [new Error('Lead already converted'), 409],
    [{ code: 'P2002' }, 409],
    [{ code: 'P2025' }, 404],
    [{ code: 'P2003' }, 409],
    [{ name: 'MulterError', message: 'File too large' }, 400],
    [{ status: 400, message: 'Unexpected token in JSON request body' }, 400],
  ])('maps known errors to the expected HTTP status', (error, expectedStatus) => {
    expect(mapHttpError(error).status).toBe(expectedStatus);
  });

  it('does not expose unknown internal error messages', () => {
    expect(mapHttpError(new Error('secret internal implementation detail'))).toEqual({
      status: 500,
      message: 'An unexpected server error occurred.',
    });
  });

  it('does not expose raw Prisma validation details', () => {
    expect(
      mapHttpError({ name: 'PrismaClientValidationError', message: 'Invalid `delegate.create()`' })
    ).toEqual({ status: 500, message: 'A database operation failed.' });
  });
});
