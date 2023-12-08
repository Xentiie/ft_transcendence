import { Req, Controller, Get, Post, Delete, Body, HttpException, HttpStatus, ValidationPipe } from '@nestjs/common'
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger'

import { UserService } from "./user.service"
import { Request } from 'src/auth/interfaces/request.interface'
import { Route } from 'src/route'
import { NotificationsService } from 'src/notifications/notifications.service'


class SendFriendRequestBody {
  @ApiProperty({ description: 'User to send the request to' })
  username: string
}
class AcceptFriendRequestBody {
  @ApiProperty({ description: 'Id of the request'})
  id:number
}
class DenyFriendRequestBody {
  @ApiProperty({ description: 'Id of the request'})
  id:number
}
class RemoveFriendBody {
  @ApiProperty({ description: 'Id of the user to remove'})
  user_id:number
}

class SendPlayRequestBody {
  @ApiProperty({ description: 'User to send the request to' })
  username: string
}
class AcceptPlayRequestBody {
  @ApiProperty({ description: 'Id of the request'})
  id:number
}
class DenyPlayRequestBody {
  @ApiProperty({ description: 'Id of the request'})
  id:number
}


class BlockFriendBody {
  @ApiProperty({ description: 'Id of the user to block'})
  user_id:number
}

@ApiBearerAuth()
@ApiTags('user')
@Controller('user')
export class UserController {

  constructor(
    private userService: UserService,
    private notificationService: NotificationsService
  )  { }

  @Route({
    method:Get('me'),
    description:{ summary:'Get user info', description:'Returns authenticated user\'s info' },
    responses: [{status:200, description:'Found user successfully'}]
  })
  getMe(@Req() req: Request) {
    return this.userService.getUser({id:req.user.id})
  }

  @Route({
    method:Get('/'),
    description:{ summary:'Get all users info', description:'Returns all users info' },
    responses: [{status:200, description:'Found user successfully'}]
  })
  getAllUsers() {
    return this.userService.getUsers()
  }


  @Route({
    method:Get('friend_request'),
    description:{summary:'Get all friend requests', description:'Get all friend requests'},
  })
  async get_friend_request(@Req() req: Request) {
    const user = await this.userService.getUser({id:req.user.id}, [
      'friends_requests_recv',
      'friends_requests_recv.sender',
      'friends_requests_recv.receiver',
      
      'friends_requests_sent',
      'friends_requests_sent.sender',
      'friends_requests_sent.receiver'
    ])
    return {
      received:user.friends_requests_recv,
      sent:user.friends_requests_sent
    }
  }

  @Route({
    method:Post('friend_request'),
    description:{summary:'Sends a friend request', description:'Sends a friend request'},
  })
  async send_friend_request(@Req() req: Request, @Body() body: SendFriendRequestBody) {
    if (!body.username)
      throw new HttpException("Missing parameter", HttpStatus.BAD_REQUEST)

    const from = await this.userService.getUser({id:req.user.id})
    const to = await this.userService.getUser({username:body.username})
    if (from.id === to.id)
      throw new HttpException("Can't add yourself as a friend, sry", HttpStatus.BAD_REQUEST)
    const friend_req = await this.userService.sendFriendRequest(from, to)
    
    this.notificationService.emit([to], "friend_request_recv", {req:friend_req})
    
    return friend_req
  }

  @Route({
    method:Post('friend_request_accept'),
    description:{summary:'Accepts a friend request', description:'Accepts a friend request'},
  })
  async accept_friend_request(@Req() req: Request, @Body() body: AcceptFriendRequestBody) {
    if (!body.id)
      throw new HttpException("Missing parameter", HttpStatus.BAD_REQUEST)

    try {
      await this.userService.getUser({id:req.user.id, friends_requests_recv:{id:body.id}})
    }
    catch (e) {
      if (e instanceof HttpException)
        throw new HttpException("Request not foud or not allowed", HttpStatus.BAD_REQUEST)
    }

    const fr = await this.userService.getFriendRequest({id:body.id}, ['sender', 'receiver'])
    this.userService.acceptFriendRequest(body.id)
    this.notificationService.emit([fr.receiver, fr.sender], "friend_request_accepted", {req:fr})
  }

  @Route({
    method:Post('friend_request_deny'),
    description:{summary:'Deny a friend request', description:'Deny a friend request'},
  })
  async deny_friend_request(@Req() req: Request, @Body() body: DenyFriendRequestBody) {
    if (!body.id)
      throw new HttpException("Missing parameter", HttpStatus.BAD_REQUEST)
    try {
      await this.userService.getUser({id:req.user.id, friends_requests_recv:{id:body.id}})
    }
    catch (e) {
      if (e instanceof HttpException)
        throw new HttpException("Request not foud or not allowed", HttpStatus.BAD_REQUEST)
    }

    const fr = await this.userService.getFriendRequest({id:body.id}, ['sender', 'receiver'])
    this.userService.denyFriendRequest(body.id)
    this.notificationService.emit([fr.receiver, fr.sender], "friend_request_denied", {req:fr})
  }

  @Route({
    method:Get('friends'),
    description:{summary:'Returns the friend list', description:'Returns the friend list'}
  })
  async get_friends_list(@Req() req: Request) {
    const user = await this.userService.getUser({id:req.user.id}, ['friends'])
    return user.friends
  }

  @Route({
    method:Post('remove_friend'),
    description:{summary:'Removes a friend from friend list', description:'Removes a friend from friend list'},
  })
  async remove_friend(@Req() req: Request, @Body() body: RemoveFriendBody) {
    if (!body.user_id)
      throw new HttpException("Missing parameter", HttpStatus.BAD_REQUEST)
    this.userService.removeFriend(req.user.id, body.user_id)
  }

  @Route({
    method:Get('blocked'),
    description:{summary:'Get the blocked user list', description:'Get the blocked user list'},
  })
  async get_blocked_list(@Req() req: Request) {
    const user = await this.userService.getUser({id:req.user.id}, ['blocked'])
    return user.blocked
  }

  @Route({
    method:Post('blocked'),
    description:{summary:'Blocks a user', description:'Blocks a user'},
  })
  async block_user(@Req() req: Request, @Body() body: BlockFriendBody) {
    if (!body.user_id)
      throw new HttpException("Missing parameter", HttpStatus.BAD_REQUEST)
    if (req.user.id === body.user_id)
      throw new HttpException("Can't block yourself, sry", HttpStatus.BAD_REQUEST)
    this.userService.blockUser(req.user.id, body.user_id)
    this.userService.removeFriend(req.user.id, body.user_id)
  }

  @Route({
    method:Delete('blocked'),
    description:{summary:'Unblocks a user', description:'Unblocks a user'},
  })
  async unblock_user(@Req() req: Request, @Body() body: BlockFriendBody) {
    if (!body.user_id)
      throw new HttpException("Missing parameter", HttpStatus.BAD_REQUEST)
    if (req.user.id === body.user_id)
      throw new HttpException("Can't unblock yourself, sry", HttpStatus.BAD_REQUEST)
    this.userService.unblockUser(req.user.id, body.user_id)
  }



  @Route({
    method:Get('play_request'),
    description:{summary:'Get all play requests', description:'Get all play requests'},
  })
  async get_play_request(@Req() req: Request) {
    const user = await this.userService.getUser({id:req.user.id}, [
      'play_requests_recv',
      'play_requests_recv.sender',
      'play_requests_recv.receiver',
      
      'play_requests_sent',
      'play_requests_sent.sender',
      'play_requests_sent.receiver'
    ])
    return {
      received:user.play_requests_recv,
      sent:user.play_requests_sent
    }
  }

  @Route({
    method:Post('play_request'),
    description:{summary:'Sends a play request', description:'Sends a play request'},
  })
  async send_play_request(@Req() req: Request, @Body() body: SendPlayRequestBody) {
    if (!body.username)
      throw new HttpException("Missing parameter", HttpStatus.BAD_REQUEST)

    const from = await this.userService.getUser({id:req.user.id})
    const to = await this.userService.getUser({username:body.username})
    if (from.id === to.id)
      throw new HttpException("Can't play with yourself, sry", HttpStatus.BAD_REQUEST)
    const friend_req = await this.userService.sendFriendRequest(from, to)
    
    this.notificationService.emit([to], "play_request_recv", {req:friend_req})
    
    return friend_req
  }

  @Route({
    method:Post('play_request_accept'),
    description:{summary:'Accepts a friend request', description:'Accepts a friend request'},
  })
  async accept_play_request(@Req() req: Request, @Body() body: AcceptPlayRequestBody) {
    if (!body.id)
      throw new HttpException("Missing parameter", HttpStatus.BAD_REQUEST)

    try {
      await this.userService.getUser({id:req.user.id, play_requests_recv:{id:body.id}})
    }
    catch (e) {
      if (e instanceof HttpException)
        throw new HttpException("Request not foud or not allowed", HttpStatus.BAD_REQUEST)
    }

    /*
    const fr = await this.userService.getFriendRequest({id:body.id}, ['sender', 'receiver'])
    this.notificationService.emit([fr.receiver, fr.sender], "play_request_accepted", {req:fr})
    */
   
   this.userService.acceptPlayRequest(body.id)
    //TODO: launch game with those 2 players
  }

  @Route({
    method:Post('play_request_deny'),
    description:{summary:'Deny a play request', description:'Deny a play request'},
  })
  async deny_play_request(@Req() req: Request, @Body() body: DenyPlayRequestBody) {
    if (!body.id)
      throw new HttpException("Missing parameter", HttpStatus.BAD_REQUEST)
    try {
      await this.userService.getUser({id:req.user.id, play_requests_recv:{id:body.id}})
    }
    catch (e) {
      if (e instanceof HttpException)
        throw new HttpException("Request not foud or not allowed", HttpStatus.BAD_REQUEST)
    }

    this.userService.denyPlayRequest(body.id)
  }


}