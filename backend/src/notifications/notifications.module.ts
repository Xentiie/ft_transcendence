import { Module, forwardRef } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsController } from './notifications.controller';
import { UserModule } from 'src/db/user';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule)
  ],
  providers: [
    NotificationsGateway,
    NotificationsService
  ],
  controllers: [
    NotificationsController
  ],
  exports: [NotificationsService]
})
export class NotificationsModule { }