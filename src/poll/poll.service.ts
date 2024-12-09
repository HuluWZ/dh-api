import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import { CreatePollDto, CreateVoteDto, UpdatePollDto } from './dto/poll.dto';

@Injectable()
export class PollService {
  constructor(private readonly prismaService: PrismaService) {}

  createPoll(createPollDto: CreatePollDto, createdBy: number) {
    return this.prismaService.poll.create({
      data: { ...createPollDto, createdBy },
    });
  }

  getPolls() {
    return this.prismaService.poll.findMany({ include: { votes: true } });
  }

  getPollById(id: number) {
    return this.prismaService.poll.findUnique({
      where: { id },
      include: { votes: true },
    });
  }

  getPollByGroupId(groupId: number) {
    return this.prismaService.poll.findMany({
      where: { groupId },
      include: { votes: true },
    });
  }

  deletePoll(id: number) {
    return this.prismaService.poll.delete({ where: { id } });
  }

  isAlreadyVoted(pollId: number, userId: number) {
    return this.prismaService.pollVote.findFirst({
      where: { pollId, userId },
    });
  }
  createVote(pollId: number, userId: number, createVoteDto: CreateVoteDto) {
    return this.prismaService.pollVote.create({
      data: {
        pollId,
        ...createVoteDto,
        userId,
      },
    });
  }

  getVotes(pollId: number) {
    return this.prismaService.pollVote.findMany({
      where: { pollId },
      include: { user: true, poll: true },
    });
  }

  getVoteById(id: number) {
    return this.prismaService.pollVote.findUnique({
      where: { id },
      include: { user: true, poll: true },
    });
  }
  getMyVotes(userId: number) {
    return this.prismaService.pollVote.findMany({
      where: { userId },
      include: { user: true, poll: true },
    });
  }

  deleteVote(id: number) {
    return this.prismaService.pollVote.delete({ where: { id } });
  }
  updatePoll(id: number, updatePollDto: UpdatePollDto) {
    return this.prismaService.poll.update({
      where: { id },
      data: updatePollDto,
    });
  }
}
