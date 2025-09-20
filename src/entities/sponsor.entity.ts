import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base.entity";

@Entity('sponsors')
export class SponsorEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  image: string;

  @Column()
  content: string;

  @Column()
  url: string;
}
  