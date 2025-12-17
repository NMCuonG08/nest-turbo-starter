import { ERROR_RESPONSE, AllExceptionFilter } from '@app/common';
import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
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
import { QuizCategoryService } from './quiz-category.service';
import { QuizCategoryMessagePattern } from './quiz-category.enum';

@UseFilters(AllExceptionFilter)
@Controller()
export class QuizCategoryConsumer {
  constructor(private readonly quizCategoryService: QuizCategoryService) {}

  @MessagePattern(QuizCategoryMessagePattern.CREATE_QUIZ_CATEGORY)
  async createCategory(
    data: CreateQuizCategoryDataDto,
  ): Promise<CreateQuizCategoryResponseDto> {
    return this.quizCategoryService.createCategory(data);
  }

  @MessagePattern(QuizCategoryMessagePattern.GET_QUIZ_CATEGORY)
  async getCategory(
    data: GetQuizCategoryDataDto,
  ): Promise<GetQuizCategoryResponseDto> {
    return this.quizCategoryService.getCategory(data);
  }

  @MessagePattern(QuizCategoryMessagePattern.GET_QUIZ_CATEGORIES)
  async getCategories(
    data: GetQuizCategoriesDataDto,
  ): Promise<GetQuizCategoriesResponseDto> {
    return this.quizCategoryService.getCategories(data);
  }

  @MessagePattern(QuizCategoryMessagePattern.UPDATE_QUIZ_CATEGORY)
  async updateCategory(
    data: UpdateQuizCategoryDataDto,
  ): Promise<UpdateQuizCategoryResponseDto> {
    return this.quizCategoryService.updateCategory(data);
  }

  @MessagePattern(QuizCategoryMessagePattern.DELETE_QUIZ_CATEGORY)
  async deleteCategory(
    data: DeleteQuizCategoryDataDto,
  ): Promise<DeleteQuizCategoryResponseDto> {
    return this.quizCategoryService.deleteCategory(data);
  }
}

