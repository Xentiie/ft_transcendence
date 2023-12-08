// src/chat/chat.gateway.ts

import { Inject, forwardRef } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, SubscribeMessage } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

import { AuthService } from 'src/auth/auth.service'
import { UserService } from 'src/db/user'
import { NotificationsService } from './notifications.service'


@WebSocketGateway({namespace:'notifications'})
export class NotificationsGateway implements OnGatewayConnection {

  @WebSocketServer() server: Server

  constructor (
      private notificationService: NotificationsService,
      @Inject(forwardRef(() => AuthService))
      private authService: AuthService,
      @Inject(forwardRef(() => UserService))
      private userService: UserService
    ) {}

  async handleConnection(client: Socket) {
  }

  async handleDisconnect(client: Socket): Promise<any> {
    this.notificationService.removeClient(client)
  }

}
