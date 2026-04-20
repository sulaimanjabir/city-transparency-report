import { Controller, Post, Put, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CasesService } from './cases.service';
import { SubmitComplaintDto } from './dto/submit-complaint.dto';
import { SolveCaseDto } from './dto/solve-case.dto';
import { JoinCaseDto } from './dto/join-case.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../database/schemas/user.schema';

@Controller('cases')
@UseGuards(JwtAuthGuard)
export class CasesController {
  constructor(private casesService: CasesService) {}

  @Post()
  @Roles(UserRole.CITIZEN)
  @UseGuards(RolesGuard)
  submitComplaint(@Request() req, @Body() dto: SubmitComplaintDto) {
    return this.casesService.submitComplaint(req.user.userId, dto);
  }

  @Post(':id/join')
  @Roles(UserRole.CITIZEN)
  @UseGuards(RolesGuard)
  joinCase(@Param('id') id: string, @Request() req, @Body() dto: JoinCaseDto) {
    return this.casesService.joinCase(id, req.user.userId, dto);
  }

  @Put(':id/in-progress')
  @Roles(UserRole.DEPT_ADMIN)
  @UseGuards(RolesGuard)
  markInProgress(@Param('id') id: string, @Request() req) {
    return this.casesService.markInProgress(id, req.user);
  }

  @Put(':id/solve')
  @Roles(UserRole.DEPT_ADMIN)
  @UseGuards(RolesGuard)
  markSolved(@Param('id') id: string, @Request() req, @Body() dto: SolveCaseDto) {
    return this.casesService.markSolved(id, req.user, dto);
  }

  @Get('feed/:cityId')
  getCityFeed(@Param('cityId') cityId: string) {
    return this.casesService.getCityFeed(cityId);
  }

  @Get('department')
  @Roles(UserRole.DEPT_ADMIN)
  @UseGuards(RolesGuard)
  getDeptCases(@Request() req) {
    return this.casesService.getDeptCases(req.user);
  }

  @Get('my')
  @Roles(UserRole.CITIZEN)
  @UseGuards(RolesGuard)
  getMyCases(@Request() req) {
    return this.casesService.getMyCases(req.user.userId);
  }
}
