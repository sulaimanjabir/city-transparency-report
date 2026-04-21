import { IsNumber, Min } from 'class-validator';

export class DonateDto {
  @IsNumber()
  @Min(1)
  amount: number;
}
