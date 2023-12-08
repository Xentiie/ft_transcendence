import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Req } from '@nestjs/common'

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { Route } from 'src/route'

import { MessageService } from './message.service';
import { Request } from 'src/auth/interfaces/request.interface';

@ApiBearerAuth()
@ApiTags('messages')
@Controller('messages')
export class MessageController {

  constructor(
    private messageService: MessageService,
  ) { }

  @Route({
    method: Get(':id'),
    description: { summary: 'Get message by id', description: 'Get message by id' }
  })
  GetById(@Param('id') id: number) {
    return this.messageService.getMessage({ id: id }, ['conversation', 'sender', 'sender.user']);
  }

  @Route({
    method: Delete(':id'),
    description: { summary: 'Delete message by id', description: 'Delete message by id. Only allowed for message owner or conversation admin' }
  })
  async DeleteById(@Param('id') id: number, @Req() req: Request) {

    const message = await this.messageService.getMessage({ id: id }, [
      'sender', 'sender.user',
      'conversation', 'conversation.owner', 'conversation.users', 'conversation.users.user'
    ])
  
    if ((message.sender.user.id === req.user.id) ||
      (message.conversation.owner.id === req.user.id) ||
      (message.conversation.users.find((u) => { u.user.id == req.user.id })?.isAdmin)) {
      this.messageService.remove(message)
    } else {
      throw new HttpException('Not allowed', HttpStatus.BAD_REQUEST)
    }
  }

  @Route({
    method: Get('from/:user_id'),
    description: { summary: 'Get all messages of a certain user', description: 'Get all messages of a certain user' }
  })
  GetFromUserId(@Param('user_id') user_id: number) {
    return this.messageService.getMessages({ sender: { user:{id:user_id}} }, ['sender', 'sender.user'])
  }

}