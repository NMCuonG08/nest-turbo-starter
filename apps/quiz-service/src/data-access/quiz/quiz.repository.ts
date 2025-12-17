import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { BaseRepository } from '../base.repository';
import { Quiz } from './quiz.entity';

@Injectable()
export class QuizRepository extends BaseRepository<Quiz> {
  constructor(private dataSource: DataSource) {
    super(Quiz, dataSource.createEntityManager());
  }
}

