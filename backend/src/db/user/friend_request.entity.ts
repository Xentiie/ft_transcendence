import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

import { User } from './user.entity';

@Entity()
export class FriendRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.friends_requests_sent)
  sender:User

  @ManyToOne(() => User, (user) => user.friends_requests_recv)
  receiver:User
}