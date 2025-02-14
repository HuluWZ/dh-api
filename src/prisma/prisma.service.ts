import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { databaseConfigType } from 'src/config/database.config';
import { setPinnedAtOnChatUpdateMiddleware } from './set-pinnedAt-chat-middleware';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly configService: ConfigService) {
    const dbConfig = configService.get<databaseConfigType>('database');
    super({
      log: ['info', 'warn', 'error'],
      datasources: {
        db: {
          url: dbConfig.URL ?? process.env.DATABASE_URL, // Use the DATABASE_URL environment variable to connect to the database
        },
      },
    });
    this.$use(setPinnedAtOnChatUpdateMiddleware);
  }

  async onModuleInit() {
    await this.$connect(); // Connect to the database on module initialization
    console.log('Connected to the database successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect(); // Disconnect from the database on module destruction
    console.log('Disconnected from the database');
  }
}
