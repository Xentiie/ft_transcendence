import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Conversation } from '../conversation/conversation.entity';
import { ConversationUser } from '../conversation/conversation_user/conversation_user.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ConversationUser, {onDelete: 'CASCADE'}) //{ onDelete: 'SET NULL' }
  @JoinColumn()
  sender: ConversationUser;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  @JoinColumn()
  conversation: Conversation;

  @Column()
  content: string;
}
