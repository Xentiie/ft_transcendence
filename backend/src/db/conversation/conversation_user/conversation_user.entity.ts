import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm'
import { User } from '../../user'
import { Message } from '../../message'
import { Conversation } from '../conversation.entity'

@Entity()
export class ConversationUser {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => User, (user) => user.conversations)
  @JoinColumn()
  user:User

  @ManyToOne(() => Conversation, (conversation) => conversation.users)
  @JoinColumn()
  conversation: Conversation

  @CreateDateColumn()
  joinedAt: Date

  @Column({default:false})
  isAdmin: boolean;
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  becameAdminAt: Date;

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[]
}