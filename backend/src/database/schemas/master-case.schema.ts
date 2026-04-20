import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MasterCaseDocument = MasterCase & Document;

export enum CaseStatus {
  PENDING = 'pending',
  VERIFYING_IN_PROGRESS = 'verifying_in_progress',
  VERIFYING = 'verifying',
  RESOLVED = 'resolved',
  DISPUTED = 'disputed',
}

@Schema({ timestamps: true })
export class MasterCase {
  @Prop({ type: Types.ObjectId, ref: 'City', required: true })
  cityId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
  departmentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ComplaintType', required: true })
  complaintTypeId: Types.ObjectId;

  @Prop({ type: String, enum: CaseStatus, default: CaseStatus.PENDING })
  status: CaseStatus;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  reporterIds: Types.ObjectId[];

  @Prop({ default: 1 })
  reportCount: number;

  @Prop({ default: 0 })
  resolvedVotes: number;

  @Prop({ default: 0 })
  notResolvedVotes: number;

  @Prop()
  solvedPhotoUrl?: string;
}

export const MasterCaseSchema = SchemaFactory.createForClass(MasterCase);
