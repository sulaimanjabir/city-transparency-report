import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VoteDocument = Vote & Document;

export enum VoteValue {
  RESOLVED = 'resolved',
  NOT_RESOLVED = 'not_resolved',
}

@Schema({ timestamps: true })
export class Vote {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'MasterCase', required: true })
  masterCaseId: Types.ObjectId;

  @Prop({ type: String, enum: VoteValue, required: true })
  value: VoteValue;
}

export const VoteSchema = SchemaFactory.createForClass(Vote);

VoteSchema.index({ userId: 1, masterCaseId: 1 }, { unique: true });
