


export type AppError = Error & {
  statusCode: number;
  details?: any;
};

export const createAppError = (
  statusCode: number,
  message: string,
  details?: any
): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.details = details;
  error.name = 'AppError';
  return error;
};