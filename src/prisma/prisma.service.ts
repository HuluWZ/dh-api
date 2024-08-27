import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['info', 'warn', 'error'], // Enable logging for Prisma queries and errors
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
