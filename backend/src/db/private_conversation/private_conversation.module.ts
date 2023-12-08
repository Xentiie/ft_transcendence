import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PrivateConversation } from './private_conversation.entity';
import { PrivateConversationService } from './private_conversation.service';
import { PrivateConversationController } from './private_conversation.controller';
import { UserModule } from '../user/user.module';
import { MessageModule } from '../message';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PrivateConversation]),
    forwardRef(() => UserModule),
    MessageModule,
    NotificationsModule,
  ],
  exports: [TypeOrmModule, PrivateConversationService],
  providers: [PrivateConversationService],
  controllers: [PrivateConversationController],
})
export class PrivateConversationModule {}