import { Module } from '@nestjs/common';
import { ComplaintTypesController } from './complaint-types.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ComplaintTypesController],
})
export class ComplaintTypesModule {}
