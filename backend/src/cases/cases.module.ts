import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MasterCase, MasterCaseSchema } from '../database/schemas/master-case.schema';
import { UserReport, UserReportSchema } from '../database/schemas/user-report.schema';
import { CasesService } from './cases.service';
import { CasesController } from './cases.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MasterCase.name, schema: MasterCaseSchema },
      { name: UserReport.name, schema: UserReportSchema },
    ]),
  ],
  providers: [CasesService],
  controllers: [CasesController],
  exports: [CasesService],
})
export class CasesModule {}
