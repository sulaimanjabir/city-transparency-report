import { Module } from '@nestjs/common';
import { DepartmentsController } from './departments.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [DepartmentsController],
})
export class DepartmentsModule {}
