import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SatisfactionVoteDocument = SatisfactionVote & Document;

export enum SatisfactionValue {
  SATISFIED = 'satisfied',
  NOT_SATISFIED = 'not_satisfied',
}

@Schema({ timestamps: true })
export class SatisfactionVote {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Initiative', required: true })
  initiativeId: Types.ObjectId;

  @Prop({ required: true, enum: SatisfactionValue })
  value: SatisfactionValue;
}

export const SatisfactionVoteSchema = SchemaFactory.createForClass(SatisfactionVote);
SatisfactionVoteSchema.index({ userId: 1, initiativeId: 1 }, { unique: true });
