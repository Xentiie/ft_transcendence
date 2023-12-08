import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TwoFactorAuthenticationService } from './2fa.service';
import { UserService } from 'src/db/user/user.service';
import { Route } from 'src/route';
import { LoggedStatus } from 'src/db/user/logged_status.interface';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { Request } from '../interfaces/request.interface';

class AuthenticateParams {
  @ApiProperty({ description: 'The 2FA code from the authentication app' })
  code: string
}

@ApiBearerAuth()
@ApiTags('2fa')
@Controller('2fa')
export class TwoFactorAuthenticationController {
  constructor(
    private twoFactorAuthenticationService: TwoFactorAuthenticationService,
    private userService: UserService,
  ) { }

  @Route({
    method: Post('authenticate'),
    description: { summary: "Authenticate using 2FA", description: "Authenticate using 2FA" }
  })
  async authenticateTwoFactor(@Req() request, @Body() body: AuthenticateParams) {
    console.log(body)
    const user = await this.userService.getUser({id:request.user.id})
    const secret = user.twoFactorAuthSecret;
  
    //this can be used to send to email
    const token = this.twoFactorAuthenticationService.generateToken(secret)
    try {
      const isCodeValid = this.twoFactorAuthenticationService.verifyTwoFactorAuthCode(
        secret,
        body.code
      );
      console.log("Secret: ", token, "Verification code: ", body.code)
      if (!isCodeValid) {
        throw new UnauthorizedException('Wrong authentication code');
      }
    } catch (error) {
      // Log the error
      console.error('Error in enableTwoFactorAuth:', error);

      // Re-throw the error to maintain the original behavior (returning a 401 response)
      throw new UnauthorizedException('Wrong authentication codee');
    }
    await this.userService.updateOrCreateUser({id:request.user.id, isAuthenticated:LoggedStatus.Logged})
    return "authenticated"
  }


  @Route({
    method: Post('enable'),
    description: { summary: "Enable 2FA", description: "Enable 2FA" }
  })
  async enableTwoFactorAuth(@Req() request, @Body() body) {
    const user = await this.userService.getUser({id:request.user.id})
  
    const secret = user.twoFactorAuthSecret
    const token = this.twoFactorAuthenticationService.generateToken(secret)
    console.log('token', token, '\n', 'body token ', body.verificationCode)
  
    try {
      const isCodeValid = this.twoFactorAuthenticationService.verifyTwoFactorAuthCode(
        secret,
        body.verificationCode
      );
      if (!isCodeValid) {
        throw new UnauthorizedException('Wrong authentication code');
      }
    } catch (error) {
      // Log the error
      console.error('Error in enableTwoFactorAuth:', error);

      // Re-throw the error to maintain the original behavior (returning a 401 response)
      throw new UnauthorizedException('Wrong authentication codee');
    }

    user.twoFactorAuth = true
    return this.userService.updateOrCreateUser(user);
  }

  @Route({
    method: Get('generate'),
    description: { summary: "Generates a new secret for 2FA", description: "Generates a new secret for 2FA" }
  })
  async generate(@Req() request) {
    const result = await this.twoFactorAuthenticationService.generateSecret(request.user.email)
    const qrcode = this.twoFactorAuthenticationService.generateQrCode(result.otpUrl)

    return qrcode
  }

  @Route({
    method: Post('disable'),
    description: { summary: "Disables 2FA", description: "Disables 2FA" }
  })
  async disableTwoFactorAuth(@Req() request: Request) {
    const user = await this.userService.getUser({id:request.user.id})
    user.twoFactorAuth = false
    return this.userService.updateOrCreateUser(user)
  }

  @Route({
    method: Get('status'),
    description: { summary: "Status of 2FA authentification", description: "Status of 2FA authentification" }
  })
  async twoFactorAuthStatus(@Req() request: Request) {
    const user = await this.userService.getUser({id:request.user.id})
    return user.twoFactorAuth ? true : false
  }
}
