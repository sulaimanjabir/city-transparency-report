import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Initiative, InitiativeDocument, InitiativeStatus } from '../database/schemas/initiative.schema';
import { Donation, DonationDocument } from '../database/schemas/donation.schema';
import { SatisfactionVote, SatisfactionVoteDocument } from '../database/schemas/satisfaction-vote.schema';
import { CreateInitiativeDto } from './dto/create-initiative.dto';
import { DonateDto } from './dto/donate.dto';
import { PostProofDto } from './dto/post-proof.dto';
import { SatisfactionVoteDto } from './dto/satisfaction-vote.dto';

@Injectable()
export class InitiativesService {
  constructor(
    @InjectModel(Initiative.name) private initiativeModel: Model<InitiativeDocument>,
    @InjectModel(Donation.name) private donationModel: Model<DonationDocument>,
    @InjectModel(SatisfactionVote.name) private satisfactionModel: Model<SatisfactionVoteDocument>,
  ) {}

  async create(user: any, dto: CreateInitiativeDto) {
    return this.initiativeModel.create({
      ...dto,
      departmentId: new Types.ObjectId(user.departmentId),
      cityId: new Types.ObjectId(user.cityId),
    });
  }

  async getCityInitiatives(cityId: string) {
    return this.initiativeModel
      .find({ cityId: new Types.ObjectId(cityId) })
      .sort({ createdAt: -1 })
      .populate('departmentId', 'name');
  }

  async getDeptInitiatives(user: any) {
    return this.initiativeModel
      .find({ departmentId: new Types.ObjectId(user.departmentId) })
      .sort({ createdAt: -1 });
  }

  async donate(userId: string, initiativeId: string, dto: DonateDto) {
    const initiative = await this.findById(initiativeId);

    if (initiative.status !== InitiativeStatus.OPEN) {
      throw new BadRequestException('This initiative is no longer accepting donations');
    }

    const userObjectId = new Types.ObjectId(userId);
    const alreadyDonated = initiative.donorIds.some((id) => id.equals(userObjectId));
    if (alreadyDonated) throw new ConflictException('You have already donated to this initiative');

    const existing = await this.donationModel.findOne({ userId: userObjectId, initiativeId: initiative._id });
    if (existing) throw new ConflictException('You have already donated to this initiative');

    await this.donationModel.create({
      userId: userObjectId,
      initiativeId: initiative._id,
      amount: dto.amount,
    });

    initiative.donorIds.push(userObjectId);
    initiative.raisedAmount += dto.amount;
    return initiative.save();
  }

  async postProof(user: any, initiativeId: string, dto: PostProofDto) {
    const initiative = await this.findById(initiativeId);

    if (!initiative.departmentId.equals(new Types.ObjectId(user.departmentId))) {
      throw new ForbiddenException('This initiative does not belong to your department');
    }

    if (initiative.status !== InitiativeStatus.OPEN) {
      throw new BadRequestException('Proof has already been posted for this initiative');
    }

    initiative.proofUrl = dto.proofUrl;
    initiative.expenseBreakdown = dto.expenseBreakdown;
    initiative.status = InitiativeStatus.COMPLETED;
    return initiative.save();
  }

  async voteSatisfaction(userId: string, initiativeId: string, dto: SatisfactionVoteDto) {
    const initiative = await this.findById(initiativeId);

    if (initiative.status !== InitiativeStatus.COMPLETED) {
      throw new BadRequestException('Satisfaction voting is only available after proof is posted');
    }

    const userObjectId = new Types.ObjectId(userId);
    const isDonor = initiative.donorIds.some((id) => id.equals(userObjectId));
    if (!isDonor) throw new ForbiddenException('Only donors can vote on satisfaction');

    const existing = await this.satisfactionModel.findOne({ userId: userObjectId, initiativeId: initiative._id });
    if (existing) throw new ConflictException('You have already voted on this initiative');

    await this.satisfactionModel.create({
      userId: userObjectId,
      initiativeId: initiative._id,
      value: dto.value,
    });

    if (dto.value === 'satisfied') {
      initiative.satisfiedCount += 1;
    } else {
      initiative.notSatisfiedCount += 1;
    }

    return initiative.save();
  }

  async getSatisfactionStatus(userId: string, initiativeId: string) {
    const vote = await this.satisfactionModel.findOne({
      userId: new Types.ObjectId(userId),
      initiativeId: new Types.ObjectId(initiativeId),
    });
    return { hasVoted: !!vote, vote: vote?.value ?? null };
  }

  async getDonationStatus(userId: string, initiativeId: string) {
    const donation = await this.donationModel.findOne({
      userId: new Types.ObjectId(userId),
      initiativeId: new Types.ObjectId(initiativeId),
    });
    return { hasDonated: !!donation, amount: donation?.amount ?? null };
  }

  private async findById(id: string): Promise<InitiativeDocument> {
    const initiative = await this.initiativeModel.findById(id);
    if (!initiative) throw new NotFoundException('Initiative not found');
    return initiative;
  }
}
