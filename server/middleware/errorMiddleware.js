export function notFound(req, _res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';
  const isProduction = process.env.NODE_ENV === 'production';

  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid request identifier';
  }

  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors).map((item) => item.message).join(', ');
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = 'This action has already been recorded';
  }

  if (error.name === 'MulterError') {
    statusCode = 400;
    message = error.message;
  }

  res.status(statusCode).json({
    success: false,
    message: isProduction && statusCode >= 500 ? 'Internal server error' : message,
    stack: isProduction ? undefined : error.stack
  });
}
