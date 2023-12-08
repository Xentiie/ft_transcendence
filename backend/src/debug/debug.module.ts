// debug.module.ts

import { Module } from '@nestjs/common'

import { DebugController } from './debug.controller'
import { UserModule } from 'src/db/user'
import { ConversationModule, MessageModule } from 'src/db'
import { AuthModule } from 'src/auth/auth.module'

@Module({
  imports: [
    UserModule, ConversationModule, MessageModule, AuthModule
  ],
  controllers: [DebugController],
})
export class DebugModule {}