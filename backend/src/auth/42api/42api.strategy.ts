import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';

import { config_42 } from 'src/config';

interface User42Api {
  id: number,
  username: string,
  image:string,
}

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor() {
    console.log(config_42)
    super({
      clientID: config_42.key,
      clientSecret: config_42.secret,
      callbackURL: config_42.redirect,
      profileFields: {
        'id': function (obj) { return String(obj.id); },
        'username': 'login',
        'email': 'email',
        'image': (obj) => {
          return obj.image.link;
        },
      }
    });
  }

  validate(accessToken: string, refreshToken: string, profile: User42Api): User42Api {
    return profile
  }
}
