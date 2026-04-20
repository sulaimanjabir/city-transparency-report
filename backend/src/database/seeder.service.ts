import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { City, CityDocument } from './schemas/city.schema';
import { Department, DepartmentDocument } from './schemas/department.schema';
import { ComplaintType, ComplaintTypeDocument } from './schemas/complaint-type.schema';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import * as seedData from '../seed-data.json';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectModel(City.name) private cityModel: Model<CityDocument>,
    @InjectModel(Department.name) private departmentModel: Model<DepartmentDocument>,
    @InjectModel(ComplaintType.name) private complaintTypeModel: Model<ComplaintTypeDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async onApplicationBootstrap() {
    await this.seed();
  }

  private async seed() {
    const existingCity = await this.cityModel.findOne({ slug: seedData.city.slug });
    if (existingCity) {
      this.logger.log('Seed data already exists, skipping.');
      return;
    }

    this.logger.log('Seeding database...');

    const city = await this.cityModel.create(seedData.city);

    for (const dept of seedData.departments) {
      const department = await this.departmentModel.create({
        name: dept.name,
        slug: dept.slug,
        cityId: city._id,
      });

      const complaintTypes = dept.complaintTypes.map((name: string) => ({
        name,
        departmentId: department._id,
      }));

      await this.complaintTypeModel.insertMany(complaintTypes);
    }

    const hashedPassword = await bcrypt.hash('superadmin123', 10);
    await this.userModel.create({
      name: 'Super Admin',
      email: 'admin@mardan.gov.pk',
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
    });

    this.logger.log(`Seeded: 1 city, ${seedData.departments.length} departments, 1 super admin.`);
    this.logger.log('Super Admin → email: admin@mardan.gov.pk | password: superadmin123');
  }
}
