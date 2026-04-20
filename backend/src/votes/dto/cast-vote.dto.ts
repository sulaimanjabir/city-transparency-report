import { IsEnum } from 'class-validator';
import { VoteValue } from '../../database/schemas/vote.schema';

export class CastVoteDto {
  @IsEnum(VoteValue, { message: 'Vote must be either resolved or not_resolved' })
  value: VoteValue;
}
