import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Vote, VoteDocument, VoteValue } from '../database/schemas/vote.schema';
import { CaseStatus, MasterCaseDocument } from '../database/schemas/master-case.schema';
import { CasesService } from '../cases/cases.service';
import { CastVoteDto } from './dto/cast-vote.dto';

const RESOLVE_THRESHOLD = 0.75;

@Injectable()
export class VotesService {
  private readonly logger = new Logger(VotesService.name);

  constructor(
    @InjectModel(Vote.name) private voteModel: Model<VoteDocument>,
    private casesService: CasesService,
  ) {}

  async castVote(userId: string, caseId: string, dto: CastVoteDto) {
    const masterCase = await this.casesService.findById(caseId);

    this.logger.log(`castVote → userId: ${userId}, caseId: ${caseId}, status: ${masterCase.status}`);
    this.logger.log(`reporterIds: ${masterCase.reporterIds.map((id) => id.toString())}`);

    if (masterCase.status !== CaseStatus.VERIFYING) {
      throw new BadRequestException('Voting is only allowed when the case is in verifying status');
    }

    const userObjectId = new Types.ObjectId(userId);
    const isReporter = masterCase.reporterIds.some((id) => id.equals(userObjectId));
    this.logger.log(`isReporter check → userObjectId: ${userObjectId}, result: ${isReporter}`);
    if (!isReporter) {
      throw new ForbiddenException('Only citizens who reported this case can vote');
    }

    const existingVote = await this.voteModel.findOne({
      userId: userObjectId,
      masterCaseId: masterCase._id,
    });

    if (existingVote) {
      throw new ConflictException('You have already voted on this case');
    }

    await this.voteModel.create({
      userId: userObjectId,
      masterCaseId: masterCase._id,
      value: dto.value,
    });

    return this.recalculate(masterCase);
  }

  private async recalculate(masterCase: MasterCaseDocument) {
    const votes = await this.voteModel.find({ masterCaseId: masterCase._id });

    const resolvedVotes = votes.filter((v) => v.value === VoteValue.RESOLVED).length;
    const notResolvedVotes = votes.filter((v) => v.value === VoteValue.NOT_RESOLVED).length;
    const totalVotesCast = votes.length;
    const totalReporters = masterCase.reporterIds.length;

    masterCase.resolvedVotes = resolvedVotes;
    masterCase.notResolvedVotes = notResolvedVotes;

    this.logger.log(`recalculate → totalVotesCast: ${totalVotesCast}, totalReporters: ${totalReporters}, resolvedVotes: ${resolvedVotes}`);

    // Only finalise once every reporter has voted
    if (totalVotesCast >= totalReporters && totalReporters > 0) {
      const resolvedPct = resolvedVotes / totalReporters;
      this.logger.log(`Finalising → resolvedPct: ${resolvedPct}`);
      if (resolvedPct >= RESOLVE_THRESHOLD) {
        masterCase.status = CaseStatus.RESOLVED;
      } else {
        masterCase.status = CaseStatus.DISPUTED;
      }
    } else {
      this.logger.log(`Waiting for more votes — ${totalVotesCast}/${totalReporters} cast`);
    }

    return masterCase.save();
  }

  async getVoteStatus(userId: string, caseId: string) {
    const vote = await this.voteModel.findOne({
      userId: new Types.ObjectId(userId),
      masterCaseId: new Types.ObjectId(caseId),
    });
    return { hasVoted: !!vote, vote: vote?.value ?? null };
  }
}
