import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { PollService } from './poll.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreatePollDto, CreateVoteDto, UpdatePollDto } from './dto/poll.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('Poll Vote')
@ApiBearerAuth()
@Controller('poll-vote')
export class PollController {
  constructor(private readonly pollService: PollService) {}

  @Post('create-poll')
  @ApiOperation({ summary: 'Create Poll' })
  @UseGuards(AuthGuard)
  async createPoll(@Body() createPollDto: CreatePollDto, @Req() req: any) {
    const userId = req.user.id;
    return this.pollService.createPoll(createPollDto, +userId);
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Update Poll' })
  @UseGuards(AuthGuard)
  async updatePoll(
    @Req() req: any,
    @Param('id') id: number,
    @Body() updatePollDto: UpdatePollDto,
  ) {
    const userId = req.user.id;
    const poll = await this.pollService.getPollById(id);
    if (!poll) {
      throw new NotFoundException('Poll not found');
    }
    if (poll.createdBy !== userId) {
      throw new UnauthorizedException('You are not authorized to update poll');
    }
    return this.pollService.updatePoll(id, updatePollDto);
  }
  @Get()
  @ApiOperation({ summary: 'Get All Polls' })
  @UseGuards(AuthGuard)
  async getAllPoll() {
    return this.pollService.getPolls();
  }
  @Get('my-votes')
  @ApiOperation({ summary: 'Get My Votes' })
  @UseGuards(AuthGuard)
  async getMyVotes(@Req() req: any) {
    const userId = req.user.id;
    return this.pollService.getMyVotes(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Poll By Id' })
  @UseGuards(AuthGuard)
  async getPoll(@Param('id') id: number) {
    return this.pollService.getPollById(id);
  }
  @Get(':groupId')
  @ApiOperation({ summary: 'Get Poll By Group Id' })
  @UseGuards(AuthGuard)
  async getPollByGroupId(@Param('groupId') groupId: number) {
    return this.pollService.getPollByGroupId(groupId);
  }

  @Post(':id/vote')
  @ApiOperation({ summary: 'Vote for Poll' })
  @UseGuards(AuthGuard)
  async vote(
    @Req() req: any,
    @Param('id') id: number,
    @Body() voteDto: CreateVoteDto,
  ) {
    const userId = req.user.id;
    const isAlreadyVoted = await this.pollService.isAlreadyVoted(id, userId);
    if (isAlreadyVoted) {
      return { message: 'You have already voted for this poll' };
    }
    return this.pollService.createVote(id, userId, voteDto);
  }
  @Delete(':pollId')
  @ApiOperation({ summary: 'Delete Poll' })
  @UseGuards(AuthGuard)
  async deletePoll(@Req() req, @Param('pollId') pollId: number) {
    return this.pollService.deletePoll(pollId);
  }

  @Delete(':id/vote')
  @ApiOperation({ summary: 'Delete Vote' })
  @UseGuards(AuthGuard)
  async retractVote(@Req() req, @Param('id') id: number) {
    return this.pollService.deleteVote(id);
  }
}
