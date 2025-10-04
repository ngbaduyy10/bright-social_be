import { Column, PrimaryGeneratedColumn } from "typeorm";

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ 
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP'
  })
  created_at: Date;

  @Column({ 
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP'
  })
  updated_at?: Date;
}