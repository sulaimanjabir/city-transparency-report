import { IsString, MinLength, MaxLength, IsNumber, Min } from 'class-validator';

export class CreateInitiativeDto {
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  title: string;

  @IsString()
  @MinLength(20)
  @MaxLength(500)
  description: string;

  @IsNumber()
  @Min(1)
  targetAmount: number;
}
