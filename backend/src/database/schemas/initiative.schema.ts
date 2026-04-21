import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InitiativeDocument = Initiative & Document;

export enum InitiativeStatus {
  OPEN = 'open',
  COMPLETED = 'completed',
}

@Schema({ timestamps: true })
export class Initiative {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  targetAmount: number;

  @Prop({ default: 0 })
  raisedAmount: number;

  @Prop({ default: InitiativeStatus.OPEN, enum: InitiativeStatus })
  status: InitiativeStatus;

  @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
  departmentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'City', required: true })
  cityId: Types.ObjectId;

  @Prop()
  proofUrl?: string;

  @Prop()
  expenseBreakdown?: string;

  @Prop({ default: 0 })
  satisfiedCount: number;

  @Prop({ default: 0 })
  notSatisfiedCount: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  donorIds: Types.ObjectId[];
}

export const InitiativeSchema = SchemaFactory.createForClass(Initiative);
