import { IsBoolean, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateQuizCategoryDataDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  iconUrl?: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;

  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateQuizCategoryResponseDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
}

