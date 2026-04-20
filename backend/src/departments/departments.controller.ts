import { Controller, Get, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Department, DepartmentDocument } from '../database/schemas/department.schema';

@Controller('departments')
export class DepartmentsController {
  constructor(@InjectModel(Department.name) private departmentModel: Model<DepartmentDocument>) {}

  @Get()
  findByCityId(@Query('cityId') cityId: string) {
    return this.departmentModel.find({ cityId: new Types.ObjectId(cityId) });
  }
}
