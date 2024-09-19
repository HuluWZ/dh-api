import {
  Body,
  Controller,
  Delete,
  Post,
  Req,
  Param,
  UnauthorizedException,
  UseGuards,
  NotFoundException,
  Get,
  Patch,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { TaskGuard } from './task.guard';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@ApiTags('Task')
@ApiBearerAuth()
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiOperation({ summary: 'Create Task' })
  @UseGuards(AuthGuard, TaskGuard)
  async addOrgMemberToGroup(
    @Body() createTaskDto: CreateTaskDto,
    @Req() req: any,
  ) {
    const createdBy = req.user.id;

    const task = await this.taskService.createTask(createTaskDto, createdBy);
    return { message: 'Task Created successfully', task };
  }
  @Post('assign/:taskId/:memberId')
  @ApiOperation({ summary: 'Assign Member Task' })
  @UseGuards(AuthGuard, TaskGuard)
  async AssignTask(
    @Req() req: any,
    @Param('taskId') taskId: number,
    @Param('memberId') memberId: number,
  ) {
    const task = await this.taskService.getTaskById(taskId);
    if (!task) {
      throw new NotFoundException('Task Not Found');
    }
    const isAlreadyTaskAssigned = await this.taskService.isAlreadyTaskAssigned(
      taskId,
      memberId,
    );
    if (isAlreadyTaskAssigned) {
      throw new UnauthorizedException('Task Already Assigned to Member');
    }
    const assigne = await this.taskService.addTaskAssignee(taskId, memberId);
    return {
      message: 'Task Assigned to Member successfully',
      assigne,
    };
  }
  @Get()
  @ApiOperation({ summary: 'Get All Tasks' })
  @UseGuards(AuthGuard, TaskGuard)
  async getAll() {
    return this.taskService.getAllTasks();
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get Task By Id' })
  @UseGuards(AuthGuard, TaskGuard)
  async getTaskById(@Param('id') id: string) {
    const task = await this.taskService.getTaskById(+id);
    return { task };
  }

  @Get('my/assigned')
  @ApiOperation({ summary: 'Get My Assigned Tasks' })
  @UseGuards(AuthGuard, TaskGuard)
  async getMyTasks(@Req() req: any) {
    const memberId: number = req.user.id;
    const myAssigned = await this.taskService.getMyAssignedTasks(memberId);
    return { myAssigned };
  }
  @Get('my/created')
  @ApiOperation({ summary: 'Get Tasks I Created' })
  @UseGuards(AuthGuard, TaskGuard)
  async getTasksCreatedByMe(@Req() req: any) {
    const memberId: number = req.user.id;
    const tasks = await this.taskService.getMyCreatedTasks(memberId);
    return { tasks };
  }

  @Patch('update/:id')
  @ApiOperation({ summary: 'Update Task By Id' })
  @UseGuards(AuthGuard, TaskGuard)
  async updateTask(
    @Req() req: any,
    @Body() updateTaskDto: UpdateTaskDto,
    @Param('id') id: number,
  ) {
    const userId: number = req.user.id;
    const task = await this.taskService.getTaskById(id);
    if (!task) {
      throw new NotFoundException('Task Not Found');
    }
    if (task.createdBy !== userId) {
      throw new UnauthorizedException(
        'Only Task Creator and Group Admin can update the Task',
      );
    }
    const updatedTask = await this.taskService.updateTask(id, updateTaskDto);
    return { message: 'Task Updated successfully', task: updatedTask };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove  Task' })
  @UseGuards(AuthGuard, TaskGuard)
  async removeTask(@Param('id') id: number) {
    await this.taskService.removeTask(id);
    return {
      message: 'Task Removed successfully',
    };
  }
  @Delete(':id/assign/:memberId')
  @ApiOperation({ summary: 'Remove Task Assigned From User' })
  @UseGuards(AuthGuard, TaskGuard)
  async removeTaskAssigned(
    @Param('id') id: number,
    @Param('memberId') memberId: number,
  ) {
    const task = await this.taskService.getTaskById(id);
    if (!task) {
      throw new NotFoundException('Task Not Found');
    }

    await this.taskService.removeTaskAssign(id, memberId);
    return {
      message: 'Member Removed From Assigned Task successfully',
    };
  }
}
