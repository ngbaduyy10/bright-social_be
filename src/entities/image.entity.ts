import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('images')
export class ImageEntity extends BaseEntity {
  @Column()
  url: string;

  @Column({ nullable: true })
  type: string;
}
