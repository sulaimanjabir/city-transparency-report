import { IsString, IsUrl, MinLength, MaxLength } from 'class-validator';

export class PostProofDto {
  @IsString()
  @IsUrl()
  proofUrl: string;

  @IsString()
  @MinLength(10)
  @MaxLength(500)
  expenseBreakdown: string;
}
