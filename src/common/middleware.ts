import * as express from 'express';
import { isNil } from 'lodash';

export const ensureAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers['authentication'];
  if (!token) {
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });
  }
  return next();

};
