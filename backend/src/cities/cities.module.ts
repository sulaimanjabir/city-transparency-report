import { Module } from '@nestjs/common';
import { CitiesController } from './cities.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CitiesController],
})
export class CitiesModule {}
