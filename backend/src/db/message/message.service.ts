import { Injectable, HttpStatus, HttpException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsWhere, Repository } from 'typeorm'

import { Message } from './message.entity'

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async getMessage(where: FindOptionsWhere<Message>, relations = [] as string[]): Promise<Message> {
    const connection = await this.messageRepository.findOne({where, relations})
    if (!connection)
      throw new HttpException('Message not found', HttpStatus.NOT_FOUND)
    return connection
  }

  async getMessages(where: FindOptionsWhere<Message>, relations = [] as string[]): Promise<Message[]> {
    const connection = await this.messageRepository.find({where, relations})
    if (!connection)
      throw new HttpException('Message not found', HttpStatus.NOT_FOUND)
    return connection
  }

  async createMessage(message:Message): Promise<Message> {
    try {
      const new_message = await this.messageRepository.save(message)
      
      return new_message
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async remove(messages: Message[]|Message): Promise<void> {
    this.messageRepository.remove(messages as any)
  }
}
