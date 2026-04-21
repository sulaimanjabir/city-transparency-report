import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DonationDocument = Donation & Document;

@Schema({ timestamps: true })
export class Donation {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Initiative', required: true })
  initiativeId: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  amount: number;
}

export const DonationSchema = SchemaFactory.createForClass(Donation);
DonationSchema.index({ userId: 1, initiativeId: 1 }, { unique: true });
