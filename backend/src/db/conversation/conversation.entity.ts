import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm'
import { User } from '../user'
import { Message } from '../message'
import { ConversationUser } from './conversation_user/conversation_user.entity'
import { ConversationUserInfos } from './conversation_user/conversation_user_infos.entity'
import { AccessLevel } from './conversation_access_level.enum'


@Entity()
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  title: string

  @Column({
    type: 'enum',
    enum: AccessLevel,
    default: AccessLevel.PUBLIC,
  })
  access_level:AccessLevel

  @Column({nullable: true})
  password?:string

  @ManyToOne(() => User)
  @JoinColumn()
  owner: User

  @OneToMany(() => ConversationUser, (conversationUser) => conversationUser.conversation)
  users: ConversationUser[]

  @OneToMany(() => ConversationUserInfos, (conversationUserInfos) => conversationUserInfos.conversation)
  users_admin_infos: ConversationUserInfos[]

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[]
}
