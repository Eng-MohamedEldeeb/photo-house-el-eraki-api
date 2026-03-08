import { NextFunction, Request, Response } from 'express';

export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err);
  res.status(500).json({ err, message: 'Internal Server Error' });
};
