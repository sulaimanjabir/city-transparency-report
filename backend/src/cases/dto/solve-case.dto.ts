import { IsString } from 'class-validator';

export class SolveCaseDto {
  @IsString()
  solvedPhotoUrl: string;
}
