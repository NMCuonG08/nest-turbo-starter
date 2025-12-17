import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from 'src/data-access/quiz/quiz.entity';
import { QuizRepository } from 'src/data-access/quiz/quiz.repository';
import { QuizCategoryRepository } from 'src/data-access/quiz-category/quiz-category.repository';
import { QuizCategory } from 'src/data-access/quiz-category/quiz-category.entity';
import { QuizConsumer } from './quiz.consumer';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, QuizCategory])],
  controllers: [QuizController, QuizConsumer],
  providers: [QuizService, QuizRepository, QuizCategoryRepository],
  exports: [QuizService],
})
export class QuizModule {}

