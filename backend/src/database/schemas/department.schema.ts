import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DepartmentDocument = Department & Document;

@Schema({ timestamps: true })
export class Department {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  slug: string;

  @Prop({ type: Types.ObjectId, ref: 'City', required: true })
  cityId: Types.ObjectId;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
