import { ERROR_RESPONSE, ServerException } from '@app/common';
import { RedisService } from '@app/core';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { QuizCategory } from 'src/data-access/quiz-category/quiz-category.entity';
import { QuizCategoryRepository } from 'src/data-access/quiz-category/quiz-category.repository';
import { DataSource, Repository } from 'typeorm';
import { Logger } from 'winston';
import {
  CreateQuizCategoryDataDto,
  CreateQuizCategoryResponseDto,
  DeleteQuizCategoryDataDto,
  DeleteQuizCategoryResponseDto,
  GetQuizCategoriesDataDto,
  GetQuizCategoriesResponseDto,
  GetQuizCategoryDataDto,
  GetQuizCategoryResponseDto,
  UpdateQuizCategoryDataDto,
  UpdateQuizCategoryResponseDto,
} from './dto';

@Injectable()
export class QuizCategoryService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly quizCategoryRepo: QuizCategoryRepository,
    private readonly redisService: RedisService,
  ) {
    this.logger = this.logger.child({ context: QuizCategoryService.name });
  }

  private readonly CACHE_KEY = 'quiz:categories:all';
  private readonly CACHE_TTL = 3600; // 1 hour

  async getAllCategories(): Promise<GetQuizCategoriesResponseDto> {
    // Try to get from cache first
    const cached = await this.redisService.getValue<GetQuizCategoriesResponseDto>(
      this.CACHE_KEY,
    );

    if (cached) {
      this.logger.debug('Returning quiz categories from cache');
      return cached;
    }

    // If not in cache, fetch from database
    const [categories, total] = await this.quizCategoryRepo.findAndCount({
      where: { isActive: true },
      order: {
        sortOrder: 'ASC',
        createdAt: 'DESC',
      },
    });

    const result: GetQuizCategoriesResponseDto = {
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

    // Cache the result
    await this.redisService.setValue(this.CACHE_KEY, result, this.CACHE_TTL);
    this.logger.debug('Cached quiz categories');

    return result;
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

    // Invalidate cache
    await this.redisService.deleteKey(this.CACHE_KEY);

    return plainToInstance(CreateQuizCategoryResponseDto, category);
  }

  async getCategory(data: GetQuizCategoryDataDto): Promise<GetQuizCategoryResponseDto> {
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
    const { search, parentId } = data;

    const [categories, total] = await this.quizCategoryRepo.findWithFilters({
      ...(search && { search, isActive: true }),
      parentId,
    });

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

    // Invalidate cache
    await this.redisService.deleteKey(this.CACHE_KEY);

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
        message:
          'Cannot delete category with children. Please delete or move children first',
      });
    }

    // Soft delete
    category.deletedAt = new Date();
    await this.quizCategoryRepo.save(category);

    // Invalidate cache
    await this.redisService.deleteKey(this.CACHE_KEY);

    return {
      success: true,
      id: category.id,
      message: 'Category deleted successfully',
    };
  }
}
