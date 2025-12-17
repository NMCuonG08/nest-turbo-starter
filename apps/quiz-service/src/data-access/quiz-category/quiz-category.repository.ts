import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { BaseRepository } from '../base.repository';
import { QuizCategory } from './quiz-category.entity';

@Injectable()
export class QuizCategoryRepository extends BaseRepository<QuizCategory> {
  constructor(private dataSource: DataSource) {
    super(QuizCategory, dataSource.createEntityManager());
  }
}

