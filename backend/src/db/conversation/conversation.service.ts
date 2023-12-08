import { Injectable, HttpException, HttpStatus, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';

import { Conversation } from './conversation.entity';
import { ConversationUser } from './conversation_user/conversation_user.entity';
import { UserService, User } from '../user';
import { MessageService } from '../message';
import { ConversationUserInfos } from './conversation_user/conversation_user_infos.entity';
import { AccessLevel } from './conversation_access_level.enum';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,

    @InjectRepository(ConversationUser)
    private convUserRepository: Repository<ConversationUser>,

    @InjectRepository(ConversationUserInfos)
    private userInfosRepository: Repository<ConversationUserInfos>,

    @Inject(forwardRef(() => UserService))
    private userService: UserService,

    private messageService: MessageService
  ) { }

  async getConversationUser(where: FindOptionsWhere<ConversationUser>, relations = [] as string[]) {
    const connection = await this.convUserRepository.findOne({ where: where, relations: relations })
    if (!connection)
      throw new HttpException('Conversation user not found', HttpStatus.NOT_FOUND);
    return connection;
  }

  async getConversationUsers(where: FindOptionsWhere<ConversationUser>, relations = [] as string[]) {
    const connection = await this.convUserRepository.find({ where: where, relations: relations })
    if (!connection)
      throw new HttpException('Conversation user not found', HttpStatus.NOT_FOUND);
    return connection;
  }

  async createConversationUser(user: User, conversation: Conversation) {
    return this.convUserRepository.save({
      user: user,
      conversation: conversation,
      messages: []
    })
  }

  async deleteConversationUser(where: FindOptionsWhere<Conversation>, clear_messages = false) {
    const conversationUser = await this.convUserRepository.findOne({ where: where, relations: (clear_messages ? ['messages'] : []) })
    if (!conversationUser)
      throw new HttpException("Conversation user not found", HttpStatus.BAD_REQUEST)
    if (clear_messages)
      this.messageService.remove(conversationUser.messages)
    this.convUserRepository.remove(conversationUser)
  }
  
  async deleteConversationUsers(where: FindOptionsWhere<Conversation>, clear_messages = false) {
    const conversationUsers = await this.convUserRepository.find({ where: where, relations: (clear_messages ? ['messages'] : []) })
    if (!conversationUsers)
      throw new HttpException("Conversation user not found", HttpStatus.BAD_REQUEST)
    conversationUsers.forEach((u) => {
      if (clear_messages)
        this.messageService.remove(u.messages)
      this.convUserRepository.remove(u)
    })
  }



  async getConversationUserInfos(where: FindOptionsWhere<ConversationUserInfos>, relations = [] as string[]) {
    const connection = await this.userInfosRepository.findOne({ where: where, relations: relations })
    if (!connection)
      throw new HttpException('Conversation user infos not found', HttpStatus.NOT_FOUND);
    return connection;
  }

  async getConversationUsersInfos(where: FindOptionsWhere<ConversationUserInfos>, relations = [] as string[]) {
    const connection = await this.userInfosRepository.find({ where: where, relations: relations })
    if (!connection)
      throw new HttpException('Conversation user infos not found', HttpStatus.NOT_FOUND);
    return connection;
  }

  async deleteConversationUserInfo(where: FindOptionsWhere<Conversation>) {
    const userInfo = await this.userInfosRepository.findOne({ where: where })
    if (!userInfo)
      throw new HttpException("Conversation user info not found", HttpStatus.BAD_REQUEST)
    this.userInfosRepository.remove(userInfo)
  }
  
  async deleteConversationUserInfos(where: FindOptionsWhere<Conversation>) {
    const userInfos = await this.userInfosRepository.find({ where: where })
    if (!userInfos)
      throw new HttpException("Conversation user info not found", HttpStatus.BAD_REQUEST)
    userInfos.forEach((u) => {
      this.userInfosRepository.remove(u)
    })
  }



  async getConversation(where: FindOptionsWhere<Conversation>, relations = [] as string[]) {
    const connection = await this.conversationRepository.findOne({ where, relations, });
    if (!connection)
      throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);
    return connection;
  }

  async getConversations(where: FindOptionsWhere<Conversation>, relations = [] as string[]) {
    const connection = await this.conversationRepository.find({ where, relations, });
    if (!connection)
      throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);
    return connection;
  }

  async getConversationsByUserId(userId: number) {
    return this.conversationRepository
      .createQueryBuilder('conversation')
      .innerJoinAndSelect('conversation.users', 'user')
      .leftJoinAndSelect('conversation.owner', 'owner')
      .innerJoin('conversation.users', 'targetUser')
      .where('targetUser.user.id = :userId', { userId })
      .getMany();
  }

  async getOwnConversationsByUserId(userId: number) {
    return this.conversationRepository
      .createQueryBuilder('conversation')
      .innerJoinAndSelect('conversation.owner', 'owner')
      .leftJoinAndSelect('conversation.users', 'users')
      .leftJoinAndSelect('users.user', 'user')
      .where('owner.id = :userId', { userId })
      .getMany();
  }

  /*
    async getAdminsConversationsByUserId(userId: number) {
      return this.conversationRepository
      .createQueryBuilder('conversation')
      .innerJoinAndSelect('conversation.admins', 'admins')
      .leftJoinAndSelect('conversation.owner', 'owner')
      .leftJoinAndSelect('conversation.users', 'user')
      .where('admins.id = :userId', { userId })
      .getMany();
    }
  */

  async createConversation(user_id: number, title: string, access_level?:AccessLevel, password?:string) {
    if (access_level && access_level == AccessLevel.PROTECTED) {
      if (!password)
        throw new HttpException("A conversation with access level of PROTECTED should have a password", HttpStatus.BAD_REQUEST)
    }

    //TODO: hash le password
    const user = await this.userService.getUser({ id: user_id })
    const new_conv = await this.conversationRepository.save({
      title: title,
      owner: user,
      access_level: access_level,
      password: password,
      users: [],
      messages: []
    })
    return await this.addUserToConversation({ id: new_conv.id }, user);
  }

  async deleteConversation(where: FindOptionsWhere<Conversation>) {
    const conversation = await this.conversationRepository.findOne({ where: where, relations: ['users', 'messages'] });
    if (conversation) {
      await this.messageService.remove(conversation.messages)
      await this.convUserRepository.remove(conversation.users)
      await this.conversationRepository.remove(conversation)
    }
  }

  async addUserToConversation(where: FindOptionsWhere<Conversation>, user: User) {
    const conv = await this.conversationRepository.findOne({ where, relations: ["users"] })

    let conv_user
    try {
      conv_user = await this.getConversationUser({ user: { id: user.id } })
    } catch (e) {
      if (e instanceof HttpException) {
        conv_user = undefined
      }
    } 
    if (!conv_user) {
      const conv_ref = await this.conversationRepository.findOne({ where, relations: [] })
      conv_user = await this.createConversationUser(user, conv_ref)
    }
    conv.users.push(conv_user)
    return await this.conversationRepository.save(conv)
  }

  async removeUserFromConversation(where: FindOptionsWhere<Conversation>, user: ConversationUser) {
    const conv = await this.getConversation(where, ['users'])
    conv.users = conv.users.filter(u => u.id != user.id)
    this.conversationRepository.save(conv)
  }

  async makeUserAdmin(user: ConversationUser) {
    user.isAdmin = true
    user.becameAdminAt = new Date()
    return this.convUserRepository.save(user)
  }




}
