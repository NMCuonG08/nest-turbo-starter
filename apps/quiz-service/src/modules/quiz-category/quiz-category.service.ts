import { ERROR_RESPONSE, ServerException } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { QuizCategoryRepository } from 'src/data-access/quiz-category/quiz-category.repository';
import { QuizCategory } from 'src/data-access/quiz-category/quiz-category.entity';
import {
  CreateQuizCategoryDataDto,
  CreateQuizCategoryResponseDto,
  DeleteQuizCategoryDataDto,
  DeleteQuizCategoryResponseDto,
  GetQuizCategoryDataDto,
  GetQuizCategoryResponseDto,
  GetQuizCategoriesDataDto,
  GetQuizCategoriesResponseDto,
  UpdateQuizCategoryDataDto,
  UpdateQuizCategoryResponseDto,
} from './dto';

@Injectable()
export class QuizCategoryService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly quizCategoryRepo: QuizCategoryRepository,
  ) {
    this.logger = this.logger.child({ context: QuizCategoryService.name });
  }

  async createCategory(
    data: CreateQuizCategoryDataDto,
  ): Promise<CreateQuizCategoryResponseDto> {
    // Check if slug already exists
    const existingCategory = await this.quizCategoryRepo.findOne({
      where: { slug: data.slug },
    });
    if (existingCategory) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_ALREADY_EXISTED);
    }

    // Check parent exists if parentId is provided
    if (data.parentId) {
      const parent = await this.quizCategoryRepo.findOne({
        where: { id: data.parentId },
      });
      if (!parent) {
        throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
      }
    }

    const category = this.quizCategoryRepo.create({
      ...data,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    });

    await this.quizCategoryRepo.save(category);

    return plainToInstance(CreateQuizCategoryResponseDto, category);
  }

  async getCategory(
    data: GetQuizCategoryDataDto,
  ): Promise<GetQuizCategoryResponseDto> {
    const where: any = {};
    if (data.id) where.id = data.id;
    if (data.slug) where.slug = data.slug;

    const category = await this.quizCategoryRepo.findOne({
      where,
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }

    return plainToInstance(GetQuizCategoryResponseDto, category, {
      enableImplicitConversion: true,
    });
  }

  async getCategories(
    data: GetQuizCategoriesDataDto,
  ): Promise<GetQuizCategoriesResponseDto> {
    const { limit = 10, offset = 0, search, parentId, isActive } = data;

    const queryBuilder = this.quizCategoryRepo.createQueryBuilder('category');

    if (search) {
      queryBuilder.where(
        '(category.name ILIKE :search OR category.slug ILIKE :search OR category.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (parentId !== undefined) {
      if (parentId === null) {
        queryBuilder.andWhere('category.parentId IS NULL');
      } else {
        queryBuilder.andWhere('category.parentId = :parentId', { parentId });
      }
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('category.isActive = :isActive', { isActive });
    }

    queryBuilder.orderBy('category.sortOrder', 'ASC');
    queryBuilder.addOrderBy('category.createdAt', 'DESC');
    queryBuilder.skip(offset);
    queryBuilder.take(limit);

    const [categories, total] = await queryBuilder.getManyAndCount();

    return {
      categories: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        iconUrl: cat.iconUrl,
        parentId: cat.parentId,
        sortOrder: cat.sortOrder,
        isActive: cat.isActive,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt,
      })),
      total,
    };
  }

  async updateCategory(
    data: UpdateQuizCategoryDataDto,
  ): Promise<UpdateQuizCategoryResponseDto> {
    const category = await this.quizCategoryRepo.findOne({
      where: { id: data.id },
    });

    if (!category) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }

    // Check if slug already exists (excluding current category)
    if (data.slug && data.slug !== category.slug) {
      const existingCategory = await this.quizCategoryRepo.findOne({
        where: { slug: data.slug },
      });
      if (existingCategory) {
        throw new ServerException(ERROR_RESPONSE.RESOURCE_ALREADY_EXISTED);
      }
    }

    // Check parent exists if parentId is provided
    if (data.parentId !== undefined) {
      if (data.parentId === null) {
        category.parentId = null;
      } else if (data.parentId === category.id) {
        throw new ServerException({
          statusCode: 400,
          errorCode: 'cannot_be_own_parent',
          message: 'Category cannot be its own parent',
        });
      } else {
        const parent = await this.quizCategoryRepo.findOne({
          where: { id: data.parentId },
        });
        if (!parent) {
          throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
        }
        category.parentId = data.parentId;
      }
    }

    // Update other fields
    if (data.name !== undefined) category.name = data.name;
    if (data.slug !== undefined) category.slug = data.slug;
    if (data.description !== undefined) category.description = data.description;
    if (data.iconUrl !== undefined) category.iconUrl = data.iconUrl;
    if (data.sortOrder !== undefined) category.sortOrder = data.sortOrder;
    if (data.isActive !== undefined) category.isActive = data.isActive;

    await this.quizCategoryRepo.save(category);

    return plainToInstance(UpdateQuizCategoryResponseDto, category);
  }

  async deleteCategory(
    data: DeleteQuizCategoryDataDto,
  ): Promise<DeleteQuizCategoryResponseDto> {
    const category = await this.quizCategoryRepo.findOne({
      where: { id: data.id },
      relations: ['children'],
    });

    if (!category) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }

    // Check if category has children
    if (category.children && category.children.length > 0) {
      throw new ServerException({
        statusCode: 400,
        errorCode: 'category_has_children',
        message: 'Cannot delete category with children. Please delete or move children first',
      });
    }

    // Soft delete
    category.deletedAt = new Date();
    await this.quizCategoryRepo.save(category);

    return {
      success: true,
      id: category.id,
      message: 'Category deleted successfully',
    };
  }
}

