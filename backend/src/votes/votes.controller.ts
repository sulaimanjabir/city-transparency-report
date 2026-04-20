import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { VotesService } from './votes.service';
import { CastVoteDto } from './dto/cast-vote.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../database/schemas/user.schema';

@Controller('votes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CITIZEN)
export class VotesController {
  constructor(private votesService: VotesService) {}

  @Post(':caseId')
  castVote(@Param('caseId') caseId: string, @Request() req, @Body() dto: CastVoteDto) {
    return this.votesService.castVote(req.user.userId, caseId, dto);
  }

  @Get(':caseId/status')
  getVoteStatus(@Param('caseId') caseId: string, @Request() req) {
    return this.votesService.getVoteStatus(req.user.userId, caseId);
  }
}
