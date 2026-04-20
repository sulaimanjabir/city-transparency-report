import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  DEPT_ADMIN = 'dept_admin',
  CITIZEN = 'citizen',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.CITIZEN })
  role: UserRole;

  @Prop({ type: Types.ObjectId, ref: 'City' })
  cityId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  departmentId?: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
