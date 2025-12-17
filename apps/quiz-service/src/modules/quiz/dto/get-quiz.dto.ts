import { IsOptional, IsString, IsUUID } from 'class-validator';
import { DifficultyLevel, QuizType } from 'src/data-access/quiz/quiz.enum';

export class GetQuizDataDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  slug?: string;
}

export class GetQuizResponseDto {
  id: string;
  title: string;
  slug: string;
  description?: string;
  categoryId: string;
  creatorId: string;
  difficultyLevel: DifficultyLevel;
  timeLimit?: number;
  maxAttempts: number;
  passingScore: number;
  isPublic: boolean;
  isActive: boolean;
  quizType: QuizType;
  instructions?: string;
  thumbnailId?: string;
  tags: string[];
  settings: Record<string, any>;
  averageRating: number;
  totalRatings: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

