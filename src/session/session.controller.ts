import { Controller, Delete, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { RedisService } from 'src/redis/redis.service';

@ApiTags('Session')
@ApiBearerAuth()
@Controller('session')
export class SessionController {
  constructor(private readonly redisService: RedisService) {}

  @Get()
  @ApiOperation({ summary: 'Get My Sessions' })
  @UseGuards(AuthGuard)
  async getMySessions(@Req() req: any) {
    const userId = req.user.id;
    const user = req.user;
    const sessions = await this.redisService.getUserSessions(userId);
    return { user, sessions };
  }
  @Get(':sessionId')
  @ApiOperation({ summary: 'Get My Session By  Session Id' })
  @UseGuards(AuthGuard)
  async getSessionById(@Req() req: any, @Param('sessionId') sessionId: string) {
    const userId = req.user.id;
    return this.redisService.getUserSession({ userId, sessionId });
  }
  @Delete()
  @ApiOperation({ summary: 'Delete All My Sessions' })
  @UseGuards(AuthGuard)
  async deleteMySessions(@Req() req: any) {
    const userId = req.user.id;
    return this.redisService.deleteAllUserSessions(userId);
  }
  @Delete(':sessionId')
  @ApiOperation({ summary: 'Delete My Session By  Session Id' })
  @UseGuards(AuthGuard)
  async deleteSession(@Req() req: any, @Param('sessionId') sessionId: string) {
    const userId = req.user.id;
    return this.redisService.deleteUserSession(userId, sessionId);
  }
}
