import { Module } from '@nestjs/common'
import { GameGateway } from './game.gateway'
import { GameController } from './game.controller'
import { UserModule } from 'src/db/user'
import { MessageModule } from 'src/db/message'
import { ConversationModule } from 'src/db/conversation'
import { AuthModule } from 'src/auth/auth.module'

@Module({
  imports: [
    UserModule,
    MessageModule,
    ConversationModule,
    AuthModule
  ],
  providers: [
    GameGateway
  ],
  controllers: [
    GameController
  ]
})
export class GameModule { }