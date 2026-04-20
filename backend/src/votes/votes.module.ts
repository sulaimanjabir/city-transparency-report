import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Vote, VoteSchema } from '../database/schemas/vote.schema';
import { VotesService } from './votes.service';
import { VotesController } from './votes.controller';
import { CasesModule } from '../cases/cases.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Vote.name, schema: VoteSchema },
    ]),
    CasesModule,
  ],
  providers: [VotesService],
  controllers: [VotesController],
})
export class VotesModule {}
