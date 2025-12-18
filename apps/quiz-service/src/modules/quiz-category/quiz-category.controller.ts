import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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
import { QuizCategoryService } from './quiz-category.service';

@Controller('quiz-category')
@ApiTags('Quiz Category')
@ApiBearerAuth()
export class QuizCategoryController {
  constructor(private readonly quizCategoryService: QuizCategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create quiz category' })
  async create(
    @Body() data: CreateQuizCategoryDataDto,
  ): Promise<CreateQuizCategoryResponseDto> {
    return this.quizCategoryService.createCategory(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all quiz categories' })
  async getAll(): Promise<GetQuizCategoriesResponseDto> {
    return this.quizCategoryService.getAllCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quiz category by id' })
  async getOne(@Param('id') id: string): Promise<GetQuizCategoryResponseDto> {
    return this.quizCategoryService.getCategory({ id });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update quiz category' })
  async update(
    @Param('id') id: string,
    @Body() data: Omit<UpdateQuizCategoryDataDto, 'id'>,
  ): Promise<UpdateQuizCategoryResponseDto> {
    return this.quizCategoryService.updateCategory({ ...data, id });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete quiz category' })
  async delete(@Param('id') id: string): Promise<DeleteQuizCategoryResponseDto> {
    return this.quizCategoryService.deleteCategory({ id });
  }
}
