import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Conversation } from './conversation.entity';
import { ConversationUser } from './conversation_user/conversation_user.entity';
import { ConversationUserInfos } from './conversation_user/conversation_user_infos.entity';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { UserModule } from '../user/user.module';
import { MessageModule } from '../message';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, ConversationUser, ConversationUserInfos]),
    forwardRef(() => UserModule),
    MessageModule,
    NotificationsModule,
  ],
  exports: [TypeOrmModule, ConversationService],
  providers: [ConversationService],
  controllers: [ConversationController],
})
export class ConversationModule {}