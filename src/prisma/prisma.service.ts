import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly configService: ConfigService) {
    // const dbConfig = configService.get('database');
    super({
      log: ['info', 'warn', 'error'],
      datasources: {
        db: {
          // url: `postgresql://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`, // Use the DATABASE_URL environment variable to connect to the database
          url: process.env.DATABASE_URL, // Use the DATABASE_URL environment variable to connect to the database
        },
      },
    });
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
