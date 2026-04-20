import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserReportDocument = UserReport & Document;

@Schema({ timestamps: true })
export class UserReport {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'MasterCase', required: true })
  masterCaseId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ComplaintType', required: true })
  complaintTypeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
  departmentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'City', required: true })
  cityId: Types.ObjectId;

  @Prop({ required: true, minlength: 10, maxlength: 100 })
  description: string;

  @Prop({ required: true })
  location: string;

  @Prop({ default: false })
  isAnonymous: boolean;
}

export const UserReportSchema = SchemaFactory.createForClass(UserReport);
