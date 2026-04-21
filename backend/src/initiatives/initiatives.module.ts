import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Initiative, InitiativeSchema } from '../database/schemas/initiative.schema';
import { Donation, DonationSchema } from '../database/schemas/donation.schema';
import { SatisfactionVote, SatisfactionVoteSchema } from '../database/schemas/satisfaction-vote.schema';
import { InitiativesService } from './initiatives.service';
import { InitiativesController } from './initiatives.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Initiative.name, schema: InitiativeSchema },
      { name: Donation.name, schema: DonationSchema },
      { name: SatisfactionVote.name, schema: SatisfactionVoteSchema },
    ]),
  ],
  providers: [InitiativesService],
  controllers: [InitiativesController],
})
export class InitiativesModule {}
