import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { UserModule } from 'src/db/user';
import { MessageModule } from 'src/db/message';
import { ConversationModule } from 'src/db/conversation';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    UserModule,
    MessageModule,
    ConversationModule,
    AuthModule
  ],
  providers: [
    ChatGateway
  ],
  controllers: [
    ChatController
  ]
})
export class ChatModule { }