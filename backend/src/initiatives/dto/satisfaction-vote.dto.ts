import { IsEnum } from 'class-validator';
import { SatisfactionValue } from '../../database/schemas/satisfaction-vote.schema';

export class SatisfactionVoteDto {
  @IsEnum(SatisfactionValue)
  value: SatisfactionValue;
}
