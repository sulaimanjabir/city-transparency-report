import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { City, CitySchema } from './schemas/city.schema';
import { Department, DepartmentSchema } from './schemas/department.schema';
import { ComplaintType, ComplaintTypeSchema } from './schemas/complaint-type.schema';
import { User, UserSchema } from './schemas/user.schema';
import { SeederService } from './seeder.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: City.name, schema: CitySchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: ComplaintType.name, schema: ComplaintTypeSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [SeederService],
  exports: [MongooseModule],
})
export class DatabaseModule {}
