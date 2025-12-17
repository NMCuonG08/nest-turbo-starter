import { IsArray, IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { DifficultyLevel, QuizType } from 'src/data-access/quiz/quiz.enum';

export class UpdateQuizDataDto {
  @IsUUID()
  id: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficultyLevel?: DifficultyLevel;

  @IsInt()
  @IsOptional()
  timeLimit?: number;

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

export class UpdateQuizResponseDto {
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
  updatedAt: Date;
  publishedAt?: Date;
}

