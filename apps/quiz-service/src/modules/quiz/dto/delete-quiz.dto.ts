import { IsUUID } from 'class-validator';

export class DeleteQuizDataDto {
  @IsUUID()
  id: string;
}

export class DeleteQuizResponseDto {
  success: boolean;
  id: string;
  message: string;
}

