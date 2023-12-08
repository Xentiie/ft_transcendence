import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Req,
  Param,
  HttpException,
  HttpStatus,
  Inject,
  forwardRef
} from '@nestjs/common'

import { ApiBearerAuth, ApiTags, ApiProperty } from '@nestjs/swagger'

import { Request } from 'src/auth/interfaces/request.interface'
import { PrivateConversationService } from './private_conversation.service'
import { UserService } from 'src/db'

import { Route } from 'src/route'

class NewPrivateConvParams {
  @ApiProperty({description:"User id to create a new private conversation with"})
  user_id: number
}

@ApiBearerAuth()
@ApiTags('private_conversation')
@Controller('private_conversation')
export class PrivateConversationController {

  constructor(
    private conversationService: PrivateConversationService,
    private userService: UserService
  ) { }

  @Route({
    method: Get('/'),
    description: { summary: 'Get users\'s private conversations', description: 'Return a list of all the private conversations the authenticated user is in' },
    responses: [{ status: 200, description: 'List of private conversations retrieved successfully'}]
  })
  async getMeConversations(@Req() req: Request) {
    return this.userService.getUser({id: req.user.id}, ['privateConversations']).then((u) => u.privateConversations)
  }

  @Route({
    method: Post('/'),
    description: { summary: 'Starts a new private conversation', description: 'Starts a new private conversation' }
  })
  async newPrivateConv(@Req() req: Request, @Body() body: NewPrivateConvParams) {
    await this.userService.getUser({id:req.user.id})
    await this.userService.getUser({id:body.user_id})
    this.conversationService.createPrivateConversation(req.user.id, body.user_id)
  }

}