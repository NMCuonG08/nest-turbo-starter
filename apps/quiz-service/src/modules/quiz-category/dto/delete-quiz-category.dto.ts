import { IsUUID } from 'class-validator';

export class DeleteQuizCategoryDataDto {
  @IsUUID()
  id: string;
}

export class DeleteQuizCategoryResponseDto {
  success: boolean;
  id: string;
  message: string;
}

