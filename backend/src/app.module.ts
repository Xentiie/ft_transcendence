import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { APP_GUARD } from '@nestjs/core'

import { User, FriendRequest, PlayRequest, UserModule } from './db/user'
import { Message, MessageModule } from './db/message'
import { Conversation, ConversationUser, ConversationUserInfos, ConversationModule } from './db/conversation'

import { ChatModule } from './chat/chat.module'

import { AuthModule } from './auth/auth.module'
import { JwtAuthGuard } from './auth/jwt/jwt.guard'

import { DebugModule } from './debug/debug.module'

import { GameModule } from './game/game.module'

import { config_db } from './config'
import { NotificationsModule } from './notifications/notifications.module'
import { ScheduleModule } from '@nestjs/schedule'
import { PrivateConversation, PrivateConversationModule } from './db/private_conversation'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: config_db.host,
      port: +config_db.port,
      username: config_db.user,
      password: config_db.password,
      database: config_db.database,
      entities: [
        User,
        Message,
      
        Conversation,
        ConversationUser,
        ConversationUserInfos,
      
        PrivateConversation,

        FriendRequest,
        PlayRequest
      ],
      synchronize: true,
    }),
    UserModule,
    MessageModule,
    ConversationModule,
    ChatModule,
    AuthModule,
    DebugModule,
    GameModule,
    NotificationsModule,
    PrivateConversationModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ]
})
export class AppModule {}