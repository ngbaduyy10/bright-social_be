import { UserEntity } from '@/entities/user.entity';

export class ResponseSuggestedUserDto extends UserEntity {
  mutual: number;
}

