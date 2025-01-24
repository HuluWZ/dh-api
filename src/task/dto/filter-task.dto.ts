import { IsEnum, IsOptional } from 'class-validator';
import { TaskPriority, TaskStatus } from '../dto/task.dto';

export class FilterTaskDto {
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;
}

export class FilterTaskByDateScheduledAssignedToMeDto {
  @IsOptional()
  today: boolean;

  @IsOptional()
  assignedToMe: boolean;

  @IsOptional()
  scheduled: boolean;
}
