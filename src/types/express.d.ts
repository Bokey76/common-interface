import * as express from 'express';

declare global {
  namespace Express {
    interface Response {
      data?: any;
      message?: string | object;
      code?: number;
    }
  }
}
