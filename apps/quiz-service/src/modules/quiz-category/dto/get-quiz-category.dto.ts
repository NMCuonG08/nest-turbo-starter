import { IsOptional, IsString, IsUUID } from 'class-validator';

export class GetQuizCategoryDataDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  slug?: string;
}

export class GetQuizCategoryResponseDto {
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
  parent?: GetQuizCategoryResponseDto;
  children?: GetQuizCategoryResponseDto[];
}

