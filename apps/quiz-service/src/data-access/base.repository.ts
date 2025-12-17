import { APP_DEFAULTS } from '@app/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { BaseEntity } from './base.entity';

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    pageSize: number;
    totalPages: number;
    page: number;
  };
}

export abstract class BaseRepository<T extends BaseEntity> extends Repository<T> {
  async paginate(
    queryBuilder: SelectQueryBuilder<T>,
    page: number = APP_DEFAULTS.PAGINATION.PAGE_DEFAULT,
    pageSize: number = APP_DEFAULTS.PAGINATION.LIMIT_DEFAULT,
  ): Promise<PaginationResult<T>> {
    page = +page;
    pageSize = +pageSize;
    const offset = (page - 1) * pageSize;

    if (offset > 0) queryBuilder.skip(offset);
    if (pageSize > 0) queryBuilder.take(pageSize);

    const [items, totalItems] = await queryBuilder.getManyAndCount();
    const totalPages = pageSize > 0 ? Math.ceil(totalItems / pageSize) : 1;

    return {
      data: items,
      pagination: {
        total: totalItems,
        pageSize,
        totalPages,
        page,
      },
    };
  }
}
