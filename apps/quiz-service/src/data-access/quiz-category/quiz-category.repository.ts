import { Injectable } from '@nestjs/common';
import { DataSource, FindOptionsWhere, ILike, IsNull } from 'typeorm';
import { QuizCategory } from './quiz-category.entity';
import { BaseRepository } from '../base.repository';

export interface FindCategoriesFilters {
  search?: string;
  parentId?: string | null;
  isActive?: boolean;
}

@Injectable()
export class QuizCategoryRepository extends BaseRepository<QuizCategory> {
  constructor(private dataSource: DataSource) {
    super(QuizCategory, dataSource.createEntityManager());
  }

  async findWithFilters(
    filters: FindCategoriesFilters,
  ): Promise<[QuizCategory[], number]> {
    const { search, parentId, isActive } = filters;

    const whereConditions: FindOptionsWhere<QuizCategory>[] = [];

    if (search) {
      whereConditions.push(
        { name: ILike(`%${search}%`) } as FindOptionsWhere<QuizCategory>,
        { slug: ILike(`%${search}%`) } as FindOptionsWhere<QuizCategory>,
        { description: ILike(`%${search}%`) } as FindOptionsWhere<QuizCategory>,
      );
    }

    const andConditions: FindOptionsWhere<QuizCategory> = {};

    if (parentId !== undefined) {
      if (parentId === null) {
        andConditions.parentId = IsNull();
      } else {
        andConditions.parentId = parentId;
      }
    }

    if (isActive !== undefined) {
      andConditions.isActive = isActive;
    }

    const where: FindOptionsWhere<QuizCategory>[] | FindOptionsWhere<QuizCategory> =
      whereConditions.length > 0
        ? whereConditions.map((condition) => ({ ...condition, ...andConditions }))
        : Object.keys(andConditions).length > 0
          ? andConditions
          : {};

    return this.findAndCount({
      where,
      order: {
        sortOrder: 'ASC',
        createdAt: 'DESC',
      },
    });
  }
}
