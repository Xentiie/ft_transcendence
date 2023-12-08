import { Injectable, HttpStatus, HttpException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsWhere, Repository } from 'typeorm'

import { User } from './user.entity'
import { FriendRequest } from './friend_request.entity'
import { NotificationsService } from 'src/notifications/notifications.service'
import { PlayRequest } from './play_request.entity'

export interface Oauth42Token {
  access_token: string
  expires: string
}


/*
function merge<T>(a:T, b:Partial<T>) {
  for (const k in Object.keys(a)) {
    if (b[k]) a[k] = b[k]
  }
} 
*/
function merge<T>(a: T, b: Partial<T>): void {
  for (const key in b) {
    if (b.hasOwnProperty(key)) {
      a[key] = b[key]
    }
  }
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(FriendRequest)
    private frRepository: Repository<FriendRequest>,
    @InjectRepository(PlayRequest)
    private playRepository: Repository<PlayRequest>,

    private notificationService: NotificationsService
  ) { }

  async getUser(where: FindOptionsWhere<User> = {}, relations = [] as string[]): Promise<User> {
    const user = await this.usersRepository.findOne({ where: where, relations: relations, })
    if (!user)
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST)
    return user
  }

  async getUsers(where: FindOptionsWhere<User> = {}, relations = [] as string[]): Promise<User[]> {
    const user = await this.usersRepository.find({ where: where, relations: relations, })
    if (!user)
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST)
    return user
  }

  /*
  async createUser(user: Partial<User>): Promise<User> {
    if (await this.getUser({ id: user.id }).catch(() => null))
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST)

    const u = this.usersRepository.create(user)
    return this.usersRepository.save(u)
  }
  */

  async updateUser(user: Partial<User> & {id:number}): Promise<User> {

    if (user.id === undefined)
      throw new HttpException("User not found", HttpStatus.BAD_REQUEST)
    await this.getUser({id:user.id})
    return this.usersRepository.save({id:user.id, ...user})
  }

  async createUser(user: Partial<User> & {id:number}): Promise<User> {
    const new_user = this.usersRepository.create(user)
    const rep = await this.usersRepository.save(new_user)
    return rep
  }

  async updateOrCreateUser(user: Partial<User> & {id:number}): Promise<User> {
    let u = await this.getUser({id:user.id}).catch(() => null)
    if (!u) {
      return this.createUser(user)
    }
    return this.updateUser(Object.assign(u, user))
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id)
  }

  async sendFriendRequest(from: User, to: User) {
    return await this.frRepository.save({
      sender: from,
      receiver: to
    })
  }

  getFriendRequest(where: FindOptionsWhere<FriendRequest>, relations = [] as string[]) {
    const connection = this.frRepository.findOne({ where: where, relations: relations })
    if (!connection)
      throw new HttpException("Friend request not found", HttpStatus.BAD_REQUEST)
    return connection
  }

  async acceptFriendRequest(id: number) {
    const request = await this.frRepository.findOne({ where: { id: id }, relations: ['sender', 'receiver'] })
    if (!request)
      throw new HttpException('Friend request not found', HttpStatus.BAD_REQUEST)

    const sender = await this.getUser({ id: request.sender.id }, ['friends'])
    const receiver = await this.getUser({ id: request.receiver.id }, ['friends'])

    sender.friends.push(receiver)
    receiver.friends.push(sender)
    this.usersRepository.save(sender)
    this.usersRepository.save(receiver)
    this.frRepository.remove(request)

    this.notificationService.emit([sender], "friend_new", { user: { id: receiver.id, username: receiver.username, image: receiver.image } })
    this.notificationService.emit([receiver], "friend_new", { user: { id: sender.id, username: sender.username, image: sender.image } })
  }

  async denyFriendRequest(id: number) {
    const request = await this.frRepository.findOne({ where: { id: id }, relations: ['sender', 'receiver'] })
    this.frRepository.remove(request)
  }

  async removeFriend(user_id: number, friend_id: number) {
    const user = await this.getUser({ id: user_id }, ['friends'])
    const friend = await this.getUser({ id: friend_id }, ['friends'])

    user.friends = user.friends.filter((v) => v.id !== friend_id)
    friend.friends = friend.friends.filter((v) => v.id !== user_id)
    this.usersRepository.save(user)
    this.usersRepository.save(friend)

    this.notificationService.emit([user], "friend_delete", { user: friend })
    this.notificationService.emit([friend], "friend_delete", { user: user })
  }

  async blockUser(user_id: number, blocked_user_id: number) {
    const user = await this.getUser({ id: user_id }, ['blocked'])
    const blocked_user = await this.getUser({ id: blocked_user_id })

    user.blocked.push(blocked_user)
    this.usersRepository.save(user)

    this.notificationService.emit([user], "blocked_new", { user: blocked_user })
  }

  async unblockUser(user_id: number, blocked_user_id: number) {
    const user = await this.getUser({ id: user_id }, ['blocked'])

    const blocked = user.blocked.find((v) => v.id === blocked_user_id)
    if (!blocked)
      return
    user.blocked.filter((v) => v.id !== blocked_user_id)
    this.usersRepository.save(user)

    this.notificationService.emit([user], "blocked_delete", { user: blocked })
  }


  async acceptPlayRequest(id: number) {
    const request = await this.playRepository.findOne({ where: { id: id }, relations: ['sender', 'receiver'] })
    if (!request)
      throw new HttpException('Play request not found', HttpStatus.BAD_REQUEST)

    const sender = await this.getUser({ id: request.sender.id })
    const receiver = await this.getUser({ id: request.receiver.id })

    this.playRepository.remove(request)

    this.notificationService.emit([receiver], "play_request_recv", { user: { id: sender.id, username: sender.username, image: sender.image } })
  }

  async denyPlayRequest(id: number) {
    const request = await this.playRepository.findOne({ where: { id: id }, relations: ['sender', 'receiver'] })
    this.playRepository.remove(request)

    this.notificationService.emit([request.sender, request.receiver], "friend_request_denied", { req: request })
  }


}
