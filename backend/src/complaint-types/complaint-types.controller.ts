import { Controller, Get, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ComplaintType, ComplaintTypeDocument } from '../database/schemas/complaint-type.schema';

@Controller('complaint-types')
export class ComplaintTypesController {
  constructor(@InjectModel(ComplaintType.name) private complaintTypeModel: Model<ComplaintTypeDocument>) {}

  @Get()
  findByDepartmentId(@Query('departmentId') departmentId: string) {
    return this.complaintTypeModel.find({ departmentId: new Types.ObjectId(departmentId) });
  }
}
