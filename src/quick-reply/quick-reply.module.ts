import { Module } from '@nestjs/common';
import { QuickReplyController } from './quick-reply.controller';
import { QuickReplyService } from './quick-reply.service';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [AuthModule, JwtModule],
  controllers: [QuickReplyController],
  providers: [QuickReplyService],
})
export class QuickReplyModule {}
