export function sendSuccess(res, { statusCode = 200, message, data = {}, meta }) {
  const payload = {
    success: true,
    ...(message ? { message } : {}),
    ...data,
    ...(meta ? { meta } : {})
  };

  return res.status(statusCode).json(payload);
}

export function getPagination({ page, limit, total }) {
  return {
    page,
    limit,
    pages: Math.ceil(total / limit),
    total,
    hasNextPage: page * limit < total,
    hasPreviousPage: page > 1
  };
}
