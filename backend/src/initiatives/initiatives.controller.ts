import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { InitiativesService } from './initiatives.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../database/schemas/user.schema';
import { CreateInitiativeDto } from './dto/create-initiative.dto';
import { DonateDto } from './dto/donate.dto';
import { PostProofDto } from './dto/post-proof.dto';
import { SatisfactionVoteDto } from './dto/satisfaction-vote.dto';

@Controller('initiatives')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InitiativesController {
  constructor(private initiativesService: InitiativesService) {}

  @Post()
  @Roles(UserRole.DEPT_ADMIN)
  create(@Req() req: any, @Body() dto: CreateInitiativeDto) {
    return this.initiativesService.create(req.user, dto);
  }

  @Get('city')
  @Roles(UserRole.CITIZEN)
  getCityInitiatives(@Query('cityId') cityId: string) {
    return this.initiativesService.getCityInitiatives(cityId);
  }

  @Get('department')
  @Roles(UserRole.DEPT_ADMIN)
  getDeptInitiatives(@Req() req: any) {
    return this.initiativesService.getDeptInitiatives(req.user);
  }

  @Post(':id/donate')
  @Roles(UserRole.CITIZEN)
  donate(@Req() req: any, @Param('id') id: string, @Body() dto: DonateDto) {
    return this.initiativesService.donate(req.user.userId, id, dto);
  }

  @Put(':id/proof')
  @Roles(UserRole.DEPT_ADMIN)
  postProof(@Req() req: any, @Param('id') id: string, @Body() dto: PostProofDto) {
    return this.initiativesService.postProof(req.user, id, dto);
  }

  @Post(':id/satisfaction')
  @Roles(UserRole.CITIZEN)
  voteSatisfaction(@Req() req: any, @Param('id') id: string, @Body() dto: SatisfactionVoteDto) {
    return this.initiativesService.voteSatisfaction(req.user.userId, id, dto);
  }

  @Get(':id/satisfaction-status')
  @Roles(UserRole.CITIZEN)
  getSatisfactionStatus(@Req() req: any, @Param('id') id: string) {
    return this.initiativesService.getSatisfactionStatus(req.user.userId, id);
  }

  @Get(':id/donation-status')
  @Roles(UserRole.CITIZEN)
  getDonationStatus(@Req() req: any, @Param('id') id: string) {
    return this.initiativesService.getDonationStatus(req.user.userId, id);
  }
}
