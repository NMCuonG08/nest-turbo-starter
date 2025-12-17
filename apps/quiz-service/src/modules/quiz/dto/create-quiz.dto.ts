import { IsArray, IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { DifficultyLevel, QuizType } from 'src/data-access/quiz/quiz.enum';

export class CreateQuizDataDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  categoryId: string;

  @IsUUID()
  creatorId: string;

  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficultyLevel?: DifficultyLevel;

  @IsInt()
  @IsOptional()
  timeLimit?: number; // seconds

  @IsInt()
  @IsOptional()
  maxAttempts?: number;

  @IsNumber()
  @IsOptional()
  passingScore?: number;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsEnum(QuizType)
  @IsOptional()
  quizType?: QuizType;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsUUID()
  @IsOptional()
  thumbnailId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsOptional()
  settings?: Record<string, any>;

  @IsOptional()
  publishedAt?: Date;
}

export class CreateQuizResponseDto {
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
}

