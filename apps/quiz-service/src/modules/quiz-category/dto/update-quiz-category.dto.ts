import { IsBoolean, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateQuizCategoryDataDto {
  @IsUUID()
  id: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

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

export class UpdateQuizCategoryResponseDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  updatedAt: Date;
}

