// auth.controller.ts

import { Body, Controller, Get, HttpException, HttpStatus, Post } from '@nestjs/common'
import { ApiTags, ApiProperty } from '@nestjs/swagger'

import { AuthService } from 'src/auth/auth.service'

import { Route } from 'src/route'

import { UserService, MessageService, ConversationService, User, Conversation, Message } from 'src/db'

class AddUserParams {
  @ApiProperty({ description: 'id' })
  id: number

  @ApiProperty({ description: 'username' })
  username: string

  @ApiProperty({ description: 'image' })
  image:string

  @ApiProperty({ description: 'email' })
  email:string


}

class LogAsParams {
  @ApiProperty({ description: 'Username of user' })
  username:string
}

class NewMessageParams {
  @ApiProperty({ description: 'User id' })
  user_id:number
  @ApiProperty({ description: 'Message\'s content' })
  content:string
  @ApiProperty({ description: 'Conv name' })
  conversation_name:string
}

@ApiTags('debug')
@Controller('debug')
export class DebugController {
  
  constructor(
    private readonly userService: UserService,
    private readonly conversationService: ConversationService,
    private readonly msgService: MessageService,
    private readonly authService: AuthService
  ) {}

  @Route({
    public:true,
    method:Post('add_user'),
    description:{summary:'Add user'}
  })
  add_user(@Body() body:AddUserParams): Promise<User> {
    return this.userService.createUser(body)
  }

  @Route({
    public:true,
    method:Post('log_as'),
    description:{summary:'Log as user'}
  })
  async log_as(@Body() body:LogAsParams) {
    const user = await this.userService.getUser({username:body.username})
    const tokens = await this.authService.login(user)
    console.log('new tokens: ' , tokens)
    return tokens
  }


  @Route({
    public:true,
    method:Post('new_message'),
    description:{summary:'Add message'}
  })
  async add_message(@Body() body:NewMessageParams) {
    const conv = await this.conversationService.getConversation({title:body.conversation_name}, ['users', 'users.user'])
  
    console.log(conv.users)

    const conv_user = conv.users.find((conv_user) => (conv_user.user.id === body.user_id))
    console.log(body.user_id, conv_user.user)
    if (!conv_user)
      throw new HttpException('No user in that conversation', HttpStatus.BAD_REQUEST)

    const message = new Message()
    message.content = body.content
    message.conversation = conv
    message.sender = conv_user
    
    return this.msgService.createMessage(message)
  }

}