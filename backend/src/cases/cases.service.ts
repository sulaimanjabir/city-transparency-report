import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MasterCase, MasterCaseDocument, CaseStatus } from '../database/schemas/master-case.schema';
import { UserReport, UserReportDocument } from '../database/schemas/user-report.schema';
import { SubmitComplaintDto } from './dto/submit-complaint.dto';
import { SolveCaseDto } from './dto/solve-case.dto';
import { JoinCaseDto } from './dto/join-case.dto';

@Injectable()
export class CasesService {
  constructor(
    @InjectModel(MasterCase.name) private masterCaseModel: Model<MasterCaseDocument>,
    @InjectModel(UserReport.name) private userReportModel: Model<UserReportDocument>,
  ) {}

  async submitComplaint(userId: string, dto: SubmitComplaintDto) {
    const cityId = new Types.ObjectId(dto.cityId);
    const departmentId = new Types.ObjectId(dto.departmentId);
    const complaintTypeId = new Types.ObjectId(dto.complaintTypeId);
    const userObjectId = new Types.ObjectId(userId);

    let masterCase = await this.masterCaseModel.findOne({
      cityId,
      departmentId,
      complaintTypeId,
      status: { $in: [CaseStatus.PENDING, CaseStatus.VERIFYING_IN_PROGRESS, CaseStatus.VERIFYING] },
    });

    if (masterCase) {
      const alreadyReported = masterCase.reporterIds.some((id) => id.equals(userObjectId));
      if (alreadyReported) throw new BadRequestException('You have already reported this issue');

      masterCase.reporterIds.push(userObjectId);
      masterCase.reportCount += 1;
      await masterCase.save();
    } else {
      masterCase = await this.masterCaseModel.create({
        cityId,
        departmentId,
        complaintTypeId,
        reporterIds: [userObjectId],
        reportCount: 1,
      });
    }

    const report = await this.userReportModel.create({
      userId: userObjectId,
      masterCaseId: masterCase._id,
      complaintTypeId,
      departmentId,
      cityId,
      description: dto.description,
      location: dto.location,
      isAnonymous: dto.isAnonymous ?? false,
    });

    return { masterCase, report };
  }

  async markInProgress(caseId: string, user: any) {
    const masterCase = await this.findCaseForOfficial(caseId, user);
    if (masterCase.status !== CaseStatus.PENDING) {
      throw new BadRequestException('Case is not in pending status');
    }
    masterCase.status = CaseStatus.VERIFYING_IN_PROGRESS;
    return masterCase.save();
  }

  async markSolved(caseId: string, user: any, dto: SolveCaseDto) {
    const masterCase = await this.findCaseForOfficial(caseId, user);
    if (masterCase.status !== CaseStatus.VERIFYING_IN_PROGRESS) {
      throw new BadRequestException('Case must be in verifying_in_progress status before marking solved');
    }
    masterCase.status = CaseStatus.VERIFYING;
    masterCase.solvedPhotoUrl = dto.solvedPhotoUrl;
    return masterCase.save();
  }

  async getCityFeed(cityId: string) {
    return this.masterCaseModel
      .find({ cityId: new Types.ObjectId(cityId) })
      .sort({ reportCount: -1 })
      .populate('departmentId', 'name')
      .populate('complaintTypeId', 'name');
  }

  async getDeptCases(user: any) {
    return this.masterCaseModel
      .find({ departmentId: new Types.ObjectId(user.departmentId) })
      .sort({ createdAt: -1 })
      .populate('complaintTypeId', 'name');
  }

  async getMyCases(userId: string) {
    return this.userReportModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .populate({
        path: 'masterCaseId',
        populate: [
          { path: 'departmentId', select: 'name' },
          { path: 'complaintTypeId', select: 'name' },
        ],
      });
  }

  async joinCase(caseId: string, userId: string, dto: JoinCaseDto) {
    const masterCase = await this.findById(caseId);
    const userObjectId = new Types.ObjectId(userId);

    const alreadyReported = masterCase.reporterIds.some((id) => id.equals(userObjectId));
    if (alreadyReported) throw new BadRequestException('You have already reported this issue');

    masterCase.reporterIds.push(userObjectId);
    masterCase.reportCount += 1;
    await masterCase.save();

    await this.userReportModel.create({
      userId: userObjectId,
      masterCaseId: masterCase._id,
      complaintTypeId: masterCase.complaintTypeId,
      departmentId: masterCase.departmentId,
      cityId: masterCase.cityId,
      description: dto.description,
      location: dto.location,
      isAnonymous: dto.isAnonymous ?? false,
    });

    return masterCase;
  }

  async findById(caseId: string): Promise<MasterCaseDocument> {
    const masterCase = await this.masterCaseModel.findById(caseId);
    if (!masterCase) throw new NotFoundException('Case not found');
    return masterCase;
  }

  private async findCaseForOfficial(caseId: string, user: any): Promise<MasterCaseDocument> {
    const masterCase = await this.findById(caseId);
    if (!masterCase.departmentId.equals(new Types.ObjectId(user.departmentId))) {
      throw new ForbiddenException('This case does not belong to your department');
    }
    return masterCase;
  }
}
