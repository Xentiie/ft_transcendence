import { JwtPayload } from './jwtpayload.interface';
import { Request as ExpressRequest } from 'express'
export interface Request extends ExpressRequest {
  user: JwtPayload;
}