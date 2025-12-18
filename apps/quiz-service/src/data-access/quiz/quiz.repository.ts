import { Injectable } from '@nestjs/common';
import { DataSource, FindOptionsWhere, ILike, IsNull, Not } from 'typeorm';
import { BaseRepository } from '../base.repository';
import { Quiz } from './quiz.entity';
import { DifficultyLevel, QuizType } from './quiz.enum';

export interface FindQuizzesFilters {
  search?: string;
  categoryId?: string;
  creatorId?: string;
  difficultyLevel?: DifficultyLevel;
  quizType?: QuizType;
  isPublic?: boolean;
  isActive?: boolean;
  published?: boolean;
  limit?: number;
  offset?: number;
}

@Injectable()
export class QuizRepository extends BaseRepository<Quiz> {
  constructor(private dataSource: DataSource) {
    super(Quiz, dataSource.createEntityManager());
  }

  async findWithFilters(
    filters: FindQuizzesFilters,
  ): Promise<[Quiz[], number]> {
    const {
      search,
      categoryId,
      creatorId,
      difficultyLevel,
      quizType,
      isPublic,
      isActive,
      published,
      limit = 10,
      offset = 0,
    } = filters;

    const whereConditions: FindOptionsWhere<Quiz>[] = [];

    if (search) {
      whereConditions.push(
        { title: ILike(`%${search}%`) } as FindOptionsWhere<Quiz>,
        { slug: ILike(`%${search}%`) } as FindOptionsWhere<Quiz>,
        { description: ILike(`%${search}%`) } as FindOptionsWhere<Quiz>,
      );
    }

    const andConditions: FindOptionsWhere<Quiz> = {};

    if (categoryId) {
      andConditions.categoryId = categoryId;
    }

    if (creatorId) {
      andConditions.creatorId = creatorId;
    }

    if (difficultyLevel) {
      andConditions.difficultyLevel = difficultyLevel;
    }

    if (quizType) {
      andConditions.quizType = quizType;
    }

    if (isPublic !== undefined) {
      andConditions.isPublic = isPublic;
    }

    if (isActive !== undefined) {
      andConditions.isActive = isActive;
    }

    if (published !== undefined) {
      if (published) {
        andConditions.publishedAt = Not(IsNull());
      } else {
        andConditions.publishedAt = IsNull();
      }
    }

    const where: FindOptionsWhere<Quiz>[] | FindOptionsWhere<Quiz> =
      whereConditions.length > 0
        ? whereConditions.map((condition) => ({ ...condition, ...andConditions }))
        : Object.keys(andConditions).length > 0
          ? andConditions
          : {};

    return this.findAndCount({
      where,
      order: {
        createdAt: 'DESC',
      },
      skip: offset,
      take: limit,
    });
  }
}

