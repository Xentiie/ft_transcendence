import { LoggedStatus } from "src/db/user/logged_status.interface"

export interface JwtPayload
{
  id:number
  username:string,
  email:string,
  isTwoFactorAuthEnable:boolean,
  authentication: LoggedStatus
}