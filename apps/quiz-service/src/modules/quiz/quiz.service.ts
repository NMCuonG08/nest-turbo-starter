import { ERROR_RESPONSE, ServerException } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { QuizRepository } from 'src/data-access/quiz/quiz.repository';
import { Quiz } from 'src/data-access/quiz/quiz.entity';
import { QuizCategoryRepository } from 'src/data-access/quiz-category/quiz-category.repository';
import { DifficultyLevel, QuizType } from 'src/data-access/quiz/quiz.enum';
import {
  CreateQuizDataDto,
  CreateQuizResponseDto,
  DeleteQuizDataDto,
  DeleteQuizResponseDto,
  GetQuizDataDto,
  GetQuizResponseDto,
  GetQuizzesDataDto,
  GetQuizzesResponseDto,
  UpdateQuizDataDto,
  UpdateQuizResponseDto,
} from './dto';

@Injectable()
export class QuizService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly quizRepo: QuizRepository,
    private readonly categoryRepo: QuizCategoryRepository,
  ) {
    this.logger = this.logger.child({ context: QuizService.name });
  }

  async createQuiz(data: CreateQuizDataDto): Promise<CreateQuizResponseDto> {
    // Check if slug already exists
    const existingQuiz = await this.quizRepo.findOne({
      where: { slug: data.slug },
    });
    if (existingQuiz) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_ALREADY_EXISTED);
    }

    // Check category exists
    const category = await this.categoryRepo.findOne({
      where: { id: data.categoryId },
    });
    if (!category) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }

    const quiz = this.quizRepo.create({
      ...data,
      difficultyLevel: data.difficultyLevel ?? DifficultyLevel.MEDIUM,
      maxAttempts: data.maxAttempts ?? 1,
      passingScore: data.passingScore ?? 70.0,
      isPublic: data.isPublic ?? true,
      isActive: data.isActive ?? true,
      quizType: data.quizType ?? QuizType.PRACTICE,
      tags: data.tags ?? [],
      settings: data.settings ?? {},
      averageRating: 0.0,
      totalRatings: 0,
    });

    await this.quizRepo.save(quiz);

    return plainToInstance(CreateQuizResponseDto, quiz);
  }

  async getQuiz(data: GetQuizDataDto): Promise<GetQuizResponseDto> {
    const where: any = {};
    if (data.id) where.id = data.id;
    if (data.slug) where.slug = data.slug;

    const quiz = await this.quizRepo.findOne({
      where,
      relations: ['category'],
    });

    if (!quiz) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }

    return plainToInstance(GetQuizResponseDto, quiz, {
      enableImplicitConversion: true,
    });
  }

  async getQuizzes(data: GetQuizzesDataDto): Promise<GetQuizzesResponseDto> {
    const {
      limit = 10,
      offset = 0,
      search,
      categoryId,
      creatorId,
      difficultyLevel,
      quizType,
      isPublic,
      isActive,
      published,
    } = data;

    const [quizzes, total] = await this.quizRepo.findWithFilters({
      search,
      categoryId,
      creatorId,
      difficultyLevel,
      quizType,
      isPublic,
      isActive,
      published,
      limit,
      offset,
    });

    return {
      quizzes: quizzes.map((quiz) => ({
        id: quiz.id,
        title: quiz.title,
        slug: quiz.slug,
        description: quiz.description,
        categoryId: quiz.categoryId,
        creatorId: quiz.creatorId,
        difficultyLevel: quiz.difficultyLevel,
        timeLimit: quiz.timeLimit,
        maxAttempts: quiz.maxAttempts,
        passingScore: quiz.passingScore,
        isPublic: quiz.isPublic,
        isActive: quiz.isActive,
        quizType: quiz.quizType,
        instructions: quiz.instructions,
        thumbnailId: quiz.thumbnailId,
        tags: quiz.tags,
        averageRating: quiz.averageRating,
        totalRatings: quiz.totalRatings,
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt,
        publishedAt: quiz.publishedAt,
      })),
      total,
    };
  }

  async updateQuiz(data: UpdateQuizDataDto): Promise<UpdateQuizResponseDto> {
    const quiz = await this.quizRepo.findOne({
      where: { id: data.id },
    });

    if (!quiz) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }

    // Check if slug already exists (excluding current quiz)
    if (data.slug && data.slug !== quiz.slug) {
      const existingQuiz = await this.quizRepo.findOne({
        where: { slug: data.slug },
      });
      if (existingQuiz) {
        throw new ServerException(ERROR_RESPONSE.RESOURCE_ALREADY_EXISTED);
      }
    }

    // Check category exists if categoryId is provided
    if (data.categoryId) {
      const category = await this.categoryRepo.findOne({
        where: { id: data.categoryId },
      });
      if (!category) {
        throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
      }
      quiz.categoryId = data.categoryId;
    }

    // Update other fields
    if (data.title !== undefined) quiz.title = data.title;
    if (data.slug !== undefined) quiz.slug = data.slug;
    if (data.description !== undefined) quiz.description = data.description;
    if (data.difficultyLevel !== undefined)
      quiz.difficultyLevel = data.difficultyLevel;
    if (data.timeLimit !== undefined) quiz.timeLimit = data.timeLimit;
    if (data.maxAttempts !== undefined) quiz.maxAttempts = data.maxAttempts;
    if (data.passingScore !== undefined) quiz.passingScore = data.passingScore;
    if (data.isPublic !== undefined) quiz.isPublic = data.isPublic;
    if (data.isActive !== undefined) quiz.isActive = data.isActive;
    if (data.quizType !== undefined) quiz.quizType = data.quizType;
    if (data.instructions !== undefined) quiz.instructions = data.instructions;
    if (data.thumbnailId !== undefined) quiz.thumbnailId = data.thumbnailId;
    if (data.tags !== undefined) quiz.tags = data.tags;
    if (data.settings !== undefined) quiz.settings = data.settings;
    if (data.publishedAt !== undefined) quiz.publishedAt = data.publishedAt;

    await this.quizRepo.save(quiz);

    return plainToInstance(UpdateQuizResponseDto, quiz);
  }

  async deleteQuiz(data: DeleteQuizDataDto): Promise<DeleteQuizResponseDto> {
    const quiz = await this.quizRepo.findOne({
      where: { id: data.id },
    });

    if (!quiz) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }

    // Soft delete
    quiz.deletedAt = new Date();
    await this.quizRepo.save(quiz);

    return {
      success: true,
      id: quiz.id,
      message: 'Quiz deleted successfully',
    };
  }
}

