import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
const speakeasy = require('speakeasy');
import {toDataURL} from 'qrcode';
import { UserService } from 'src/db/user/user.service';

@Injectable()
export class TwoFactorAuthenticationService {
    constructor(private userService: UserService){}
    async generateSecret(userEmail: string) {
        const user = await this.userService.getUser({email:userEmail});
        // Generate a secret key for two-factor authentication
        const secret = speakeasy.generateSecret();
        
        // Create an OTP URL
        const otpUrl = authenticator.keyuri(user.email, '42FA', secret.base32);
    
        // Update the user's secret in the database
        user.twoFactorAuthSecret = secret.base32
        await this.userService.updateOrCreateUser(user);

        return {
          secret: secret.base32, // Using base32 representation of the secret
          otpUrl,
        };
      }
    
    async generateQrCode(optUrl: string){
        return toDataURL(optUrl)
    }

    generateToken(secret:string){
      return speakeasy.totp({
        secret,
        encoding: 'base32',
      })
    }

    verifyTwoFactorAuthCode(secret :string, token:string){
      return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 1, 
    })
    }

}
