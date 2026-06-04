export const mapPrismaError = (error: any): string => {
  // 1. Log the full raw error to the server console
  console.error('\n[Database Error]:', error?.message || error, '\n');

  const message = error?.message || String(error);

  // Identify raw Prisma stacktraces / SQL strings leaking into message
  const isPrismaLeakedMessage =
    message.includes('invocation in') ||
    message.includes('this.delegate') ||
    message.includes('Invalid `');

  // 2. Allow our own custom application errors to pass through
  // (e.g., throw new Error("Missing required fields"))
  // Custom errors usually don't have newlines or Prisma markers.
  if (
    error instanceof Error &&
    !isPrismaLeakedMessage &&
    !error.name?.includes('Prisma') &&
    !message.includes('\n')
  ) {
    return message;
  }

  // 3. Known Request Errors from Prisma
  if (error.code) {
    switch (error.code) {
      case 'P2002': {
        const fields = error.meta?.target || 'unique field';
        return `Conflict validation failed. A record with this ${fields} already exists.`;
      }
      case 'P2025':
        return 'The requested record could not be found or has already been removed.';
      case 'P2003':
        return 'Foreign key constraint failed. Please ensure the parent/related record exists.';
      case 'P2014':
        return 'The data change violates a required relationship constraint.';
      default:
        return 'A database operation failed due to internal constraints.';
    }
  }

  // 4. Catch all other database/validation errors generically
  if (isPrismaLeakedMessage || error.name?.includes('Prisma')) {
    return 'Data format validation failed. Please check your request payload or internal parameters.';
  }

  // 5. Catch all generic unknown errors
  return 'An unexpected server error occurred while processing your request.';
};
