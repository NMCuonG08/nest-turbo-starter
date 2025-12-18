import { IsBoolean, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class GetQuizCategoriesDataDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class GetQuizCategoriesResponseDto {
  categories: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    iconUrl?: string;
    parentId?: string;
    sortOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }[];
  total: number;
}

