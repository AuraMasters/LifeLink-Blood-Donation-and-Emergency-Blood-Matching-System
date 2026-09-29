export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    detail: `Route ${req.originalUrl} not found`,
    error: 'NotFoundError',
  });
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let detail = err.message || 'Internal Server Error';

  if (err.code === '23505') {
    statusCode = 409;
    detail = err.detail || 'A record with this unique identifier already exists';
  } else if (err.code === '23503') {
    statusCode = 400;
    detail = err.detail || 'Referenced foreign record does not exist';
  } else if (err.code === '23514') {
    statusCode = 400;
    detail = 'Submitted data violates database integrity check constraints';
  } else if (err.code === '22P02') {
    statusCode = 400;
    detail = 'Invalid input syntax for database field type';
  } else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    detail = 'Invalid JSON payload provided';
  }

  res.status(statusCode).json({
    detail,
    error: err.name || 'Error',
  });
};
