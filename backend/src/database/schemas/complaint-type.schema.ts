import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ComplaintTypeDocument = ComplaintType & Document;

@Schema({ timestamps: true })
export class ComplaintType {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
  departmentId: Types.ObjectId;
}

export const ComplaintTypeSchema = SchemaFactory.createForClass(ComplaintType);
