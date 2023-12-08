// auth.module.ts

import { Module, forwardRef } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'

import { FortyTwoStrategy } from './42api/42api.strategy'
import { JwtStrategy } from './jwt/jwt.strategy'
import { JwtRefreshTokenStrategy } from './jwt/jwt_refresh.strategy'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { UserModule } from 'src/db/user'

import { TwoFactorAuthenticationController } from './2fa/2fa.controller'
import { TwoFactorAuthenticationService } from './2fa/2fa.service'

@Module({
  imports: [
    JwtModule.register({}),
    PassportModule.register({ defaultStrategy: '42' }),
    forwardRef(() => UserModule)
  ],
  controllers: [
    AuthController,
    TwoFactorAuthenticationController
  ],
  providers: [
    FortyTwoStrategy,
    JwtStrategy,
    JwtRefreshTokenStrategy,
    TwoFactorAuthenticationService,
    AuthService
  ],
  exports: [
    AuthService
  ],
})
export class AuthModule {}