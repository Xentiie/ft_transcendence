import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwtpayload.interface';
import { User, UserService } from 'src/db/user';
import { config_jwt } from 'src/config';
import { LoggedStatus } from 'src/db/user/logged_status.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private jwtService: JwtService
  ) { }

  async generateAccessToken(user: User) {
    return this.jwtService.signAsync({
      id: user.id,
      username:user.username,
      email: user.email,
      isTwoFactorAuthEnable: user.twoFactorAuth,
      authentication: user.isAuthenticated
    }, { secret: config_jwt.secret_token, expiresIn: config_jwt.expires_token })
  }

  async generateRefreshToken(user: User) {
    return this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    }, { secret: config_jwt.expires_token, expiresIn: config_jwt.expires_refresh })
  }

  async login(user: Partial<User>): Promise<{ access_token: string, refresh_token: string }> {

    if (user.id)
      user.id = +user.id //to int

    const user_data = await this.userService.updateOrCreateUser({
      id:user.id,
      username:user.username,
      image:user.image,
      email:user.email
    })
    
    user_data.isAuthenticated = user_data.twoFactorAuth ? LoggedStatus.Incomplete : LoggedStatus.Logged
    await this.userService.updateUser(user_data)

    return Promise.all([this.generateAccessToken(user_data), this.generateRefreshToken(user_data)])
      .then((tokens) => ({access_token:tokens[0], refresh_token:tokens[1]}))
  }

  verifyJWT(token:string, key:string): JwtPayload {
    this.jwtService.verify(token, {secret:key})
    try {
      return this.jwtService.verify(token, {secret:key});
    } catch {
      return null;
    }
  }
}