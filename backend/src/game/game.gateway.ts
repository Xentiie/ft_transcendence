// src/chat/chat.gateway.ts

import { WebSocketGateway, WebSocketServer, OnGatewayConnection, SubscribeMessage } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Interval } from '@nestjs/schedule'

import { AuthService } from 'src/auth/auth.service'
import { UserService } from 'src/db/user'

import { Ball } from './Game/Ball'
import { GameInstance, Client, Keyboard } from './Game/GameInstance'
import { CoolSocket } from 'src/socket/coolsocket.decorator'

@WebSocketGateway({ namespace: 'game' })
export class GameGateway implements OnGatewayConnection {

  @WebSocketServer() server: Server
  private connectedClients: Client[] = []
  private waiting: Client[] = []
  private gameInstances: GameInstance[] = []

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) { }

  async handleConnection(client: Socket) {
  }

  async handleDisconnect(client: Socket): Promise<any> {
    this.connectedClients = this.connectedClients.filter((v) => v.socket !== client)
    this.waiting = this.waiting.filter((v) => v.socket !== client)
  }

  @SubscribeMessage('search')
  @CoolSocket
  async handleSearch(client: Client, test: any) {

    console.log(client.user)

    if (this.waiting.find((v) => v.socket.id === client.socket.id)) {
      console.log("Already waiting")
      return
    }

    this.waiting.push(client)

    if (this.waiting.length >= 2) {
      
      const p1 = this.waiting[0]
      const p2 = this.waiting[1]

      this.waiting = this.waiting.filter((v) => v.socket !== p1.socket && v.socket !== p2.socket)

      console.log("Starting game with: ", p1.user.username, p2.user.username)
      const gameInstance = new GameInstance(p1, p2, (b: Ball) => {
        const inverted = b.clone()
        inverted.position.x *= -1
        console.log(b.position)
        p1.socket.emit("ball_pos", inverted)
        p2.socket.emit("ball_pos", b)
      },
      (winner, looser) => {
        //TODO: update database
        this.gameInstances = this.gameInstances.filter((v) => v !== gameInstance)
      })
      this.gameInstances.push(gameInstance)
      gameInstance.start()
    }
  }

  @SubscribeMessage('player_input')
  @CoolSocket
  async handlePlayerInput(client: Client, keyboard: Keyboard) {
    const game_instance = this.gameInstances.find((gi) =>
      gi.player1.client.socket.id === client.socket.id ||
      gi.player2.client.socket.id === client.socket.id)
    if (!game_instance)
      return

    const sender = game_instance.player1.client.socket.id === client.socket.id ? game_instance.player1 : game_instance.player2
    const receiver = game_instance.player2.client.socket.id === client.socket.id ? game_instance.player1 : game_instance.player2

    game_instance.updatePlayerPos(sender, keyboard)

    receiver.client.socket.emit("player_pos", {
      you: receiver.racket,
      opponent: sender.racket
    })
    sender.client.socket.emit("player_pos", {
      you: sender.racket,
      opponent: receiver.racket
    })
  }

  @Interval(6 / 100000)
  loop() {
    this.gameInstances.forEach((gi) => {
      gi.update()
    })
  }

}
