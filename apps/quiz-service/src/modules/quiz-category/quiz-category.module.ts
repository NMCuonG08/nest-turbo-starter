import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizCategory } from 'src/data-access/quiz-category/quiz-category.entity';
import { QuizCategoryRepository } from 'src/data-access/quiz-category/quiz-category.repository';
import { QuizCategoryConsumer } from './quiz-category.consumer';
import { QuizCategoryController } from './quiz-category.controller';
import { QuizCategoryService } from './quiz-category.service';

@Module({
  imports: [TypeOrmModule.forFeature([QuizCategory])],
  controllers: [QuizCategoryController, QuizCategoryConsumer],
  providers: [QuizCategoryService, QuizCategoryRepository],
  exports: [QuizCategoryService],
})
export class QuizCategoryModule {}
