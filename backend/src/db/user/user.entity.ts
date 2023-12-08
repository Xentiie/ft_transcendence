import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';

import { ConversationUser } from '../conversation/conversation_user/conversation_user.entity';
import { FriendRequest } from './friend_request.entity';
import { PlayRequest } from './play_request.entity';
import { LoggedStatus } from './logged_status.interface';
import { PrivateConversation } from '../private_conversation/private_conversation.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  db_id:number

  @Column()
  id: number
  @Column()
  username: string;
  @Column()
  image:string
  @Column()
  email:string


  
  @Column({
    type: 'enum',
    enum: LoggedStatus,
    default: LoggedStatus.Unlogged,
  })
  isAuthenticated:LoggedStatus



  @Column({default: false})
  twoFactorAuth:boolean
  @Column({default:''})
  twoFactorAuthSecret:string;



  @OneToMany(() => ConversationUser, (conv_user) => conv_user.user)
  conversations:ConversationUser[]

  @ManyToMany(() => PrivateConversation, conversation => conversation.users)
  @JoinTable()
  privateConversations: PrivateConversation[];

  @ManyToMany(() => User)
  @JoinTable()
  blocked:User[]

  @ManyToMany(() => User)
  @JoinTable()
  friends:User[]

  @OneToMany(() => FriendRequest, (fr) => fr.receiver)
  friends_requests_recv:FriendRequest[]
  @OneToMany(() => FriendRequest, (fr) => fr.sender)
  friends_requests_sent:FriendRequest[]

  @OneToMany(() => PlayRequest, (pr) => pr.receiver)
  play_requests_recv:PlayRequest[]
  @OneToMany(() => PlayRequest, (pr) => pr.sender)
  play_requests_sent:PlayRequest[]
}
