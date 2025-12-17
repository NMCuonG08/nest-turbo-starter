import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';
import { DifficultyLevel, QuizType } from 'src/data-access/quiz/quiz.enum';

export class GetQuizzesDataDto {
  @IsInt()
  @IsOptional()
  limit?: number;

  @IsInt()
  @IsOptional()
  offset?: number;

  @IsString()
  @IsOptional()
  search?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  creatorId?: string;

  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficultyLevel?: DifficultyLevel;

  @IsEnum(QuizType)
  @IsOptional()
  quizType?: QuizType;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  published?: boolean; // true = only published, false = only unpublished, undefined = all
}

export class GetQuizzesResponseDto {
  quizzes: {
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
    averageRating: number;
    totalRatings: number;
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
  }[];
  total: number;
}

