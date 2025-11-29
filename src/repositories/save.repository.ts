import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SaveEntity } from '@/entities/save.entity';

@Injectable()
export class SaveRepository extends Repository<SaveEntity> {
  constructor(private dataSource: DataSource) {
    super(SaveEntity, dataSource.createEntityManager());
  }
}

