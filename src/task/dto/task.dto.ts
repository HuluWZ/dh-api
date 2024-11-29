import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export enum TaskPriority {
  Urgent = 'Urgent',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
  NoPriority = 'NoPriority',
}

export enum TaskStatus {
  Backlog = 'Backlog',
  Todo = 'Todo',
  InProgress = 'InProgress',
  AwaitingReview = 'AwaitingReview',
  InReview = 'InReview',
  Done = 'Done',
}

export enum LastActionType {
  Status = 'Status',
  Priority = 'Priority',
  Others = 'Others',
}

export class CreateTaskDto {
  @ApiProperty({
    example: 'Generate Finance Report',
    description: 'Task Name',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Detailed Task Description',
    description: 'Task Description',
  })
  @IsOptional()
  desc?: string;

  @ApiProperty({
    example: '2021-09-30T00:00:00.000Z',
    description: 'Task Deadline',
  })
  @IsOptional()
  deadline: Date;

  @ApiProperty({
    example: 'NoPriority / Low / Medium / High / Urgent',
    description: 'Task Priority',
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority: TaskPriority;

  @ApiProperty({
    example: 'Backlog / Todo / InProgress / AwaitingReview / InReview / Done',
    description: 'Task Status',
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status: TaskStatus;

  @ApiProperty({ example: '1', description: 'Org Group Id' })
  @IsNotEmpty()
  @IsNumber()
  groupId: number;

  @ApiProperty({ example: 'false', description: 'Is The Task Pinned' })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @ApiProperty({
    example: '[2,4]',
    description: 'Task Assignee User IDs',
  })
  @IsArray()
  @ArrayMinSize(0)
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return value;
  })
  assignedTo: number[];

  @ApiProperty({
    example: '5',
    description: 'Task Monitor User ID / Group Admin Id',
  })
  @IsOptional()
  @IsNumber()
  monitoredBy: number;
}

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
