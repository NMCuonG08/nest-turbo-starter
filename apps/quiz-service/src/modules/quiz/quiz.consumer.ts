import { AllExceptionFilter } from '@app/common';
import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
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
import { QuizService } from './quiz.service';
import { QuizMessagePattern } from './quiz.enum';

@UseFilters(AllExceptionFilter)
@Controller()
export class QuizConsumer {
  constructor(private readonly quizService: QuizService) {}

  @MessagePattern(QuizMessagePattern.CREATE_QUIZ)
  async createQuiz(data: CreateQuizDataDto): Promise<CreateQuizResponseDto> {
    return this.quizService.createQuiz(data);
  }

  @MessagePattern(QuizMessagePattern.GET_QUIZ)
  async getQuiz(data: GetQuizDataDto): Promise<GetQuizResponseDto> {
    return this.quizService.getQuiz(data);
  }

  @MessagePattern(QuizMessagePattern.GET_QUIZZES)
  async getQuizzes(data: GetQuizzesDataDto): Promise<GetQuizzesResponseDto> {
    return this.quizService.getQuizzes(data);
  }

  @MessagePattern(QuizMessagePattern.UPDATE_QUIZ)
  async updateQuiz(data: UpdateQuizDataDto): Promise<UpdateQuizResponseDto> {
    return this.quizService.updateQuiz(data);
  }

  @MessagePattern(QuizMessagePattern.DELETE_QUIZ)
  async deleteQuiz(data: DeleteQuizDataDto): Promise<DeleteQuizResponseDto> {
    return this.quizService.deleteQuiz(data);
  }
}

