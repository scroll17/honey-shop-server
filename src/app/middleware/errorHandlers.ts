/* external modules */
import { ErrorRequestHandler } from 'express';

export const csrfErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') {
    return next(err);
  } else {
    return res.status(403).json({ reason: 'csrf' });
  }
};

export default [csrfErrorHandler];
