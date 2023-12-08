import { Entity, PrimaryGeneratedColumn, ManyToMany, OneToMany, JoinTable } from 'typeorm'
import { User } from '../user'
import { Message } from '../message'


@Entity()
export class PrivateConversation {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToMany(() => User, user => user.privateConversations, { eager: true })
  @JoinTable()
  users: User[];

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[]
}
