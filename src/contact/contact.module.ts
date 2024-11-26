import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [JwtModule, AuthModule],
  providers: [ContactService, RedisService],
  controllers: [ContactController],
})
export class ContactModule {}
