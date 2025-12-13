import { AdminRole } from "@/utils/constant";

export interface JwtUserDto {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  role?: AdminRole | 'user';
}
