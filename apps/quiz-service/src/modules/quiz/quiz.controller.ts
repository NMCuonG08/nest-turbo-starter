import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { QuizService } from './quiz.service';

@Controller('quiz')
@ApiTags('Quiz')
@ApiBearerAuth()
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('info')
  getInfo() {
    return {
      message: 'Quiz API',
    };
  }
}
