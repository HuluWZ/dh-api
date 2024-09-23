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
  Query,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { TaskService } from './task.service';
import { TaskGuard } from './task.guard';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { OrgGroupService } from 'src/org-group/org-group.service';
import { FilterTaskDto } from './dto/filter-task.dto';
import { OrgMemberService } from 'src/org-member/org-member.service';

@ApiTags('Task')
@ApiBearerAuth()
@Controller('tasks')
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly orgGroupService: OrgGroupService,
    private readonly orgMemberService: OrgMemberService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create Task' })
  @UseGuards(AuthGuard, TaskGuard)
  async addOrgMemberToGroup(
    @Body() createTaskDto: CreateTaskDto,
    @Req() req: any,
  ) {
    const createdBy: number = req.user.id;
    const orgGroup = await this.orgGroupService.getGroup(createTaskDto.groupId);
    const data = await this.orgMemberService.getOrgAllMembers(orgGroup.orgId);
    const members = data.members.map((member) => member.memberId);
    if (
      !(
        (members.length > 0 && members.includes(createdBy)) ||
        (orgGroup && orgGroup.org.ownerId === createdBy)
      )
    ) {
      throw new UnauthorizedException(
        'You are not the member or owner of the group',
      );
    }
    const invalidMembers = createTaskDto.assignedTo.filter(
      (memberId) => !members.includes(memberId),
    );
    if (invalidMembers.length > 0) {
      throw new UnauthorizedException(
        'Invalid Members in assignedTo, Please check the members',
      );
    }
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
    const userId: number = req.user.id;

    const task = await this.taskService.getTaskById(taskId);
    if (!task) {
      throw new NotFoundException('Task Not Found');
    }
    const orgGroup = await this.orgGroupService.getGroup(task.groupId);
    const data = await this.orgMemberService.getOrgAllMembers(orgGroup.orgId);
    const members = data.members.map((member) => member.memberId);
    if (
      !(
        (members.length > 0 && members.includes(userId)) ||
        (orgGroup && orgGroup.org.ownerId === userId)
      )
    ) {
      throw new UnauthorizedException(
        'You are not the member or owner of the group',
      );
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
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'priority', required: false, type: String })
  @ApiOperation({ summary: 'Get All Tasks' })
  @UseGuards(AuthGuard, TaskGuard)
  async getAll(@Query() filterTaskDto: FilterTaskDto) {
    return this.taskService.getAllTasks(filterTaskDto);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get Task By Id' })
  @UseGuards(AuthGuard, TaskGuard)
  async getTaskById(@Param('id') id: string) {
    const task = await this.taskService.getTaskById(+id);
    return { task };
  }
  @Get('group/:groupId')
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'priority', required: false, type: String })
  @ApiOperation({ summary: 'Get Task By Group' })
  @UseGuards(AuthGuard, TaskGuard)
  async getTaskByGroup(
    @Param('groupId') groupId: string,
    @Query() filterTaskDto: FilterTaskDto,
  ) {
    const task = await this.taskService.getTaskByGroupId(
      +groupId,
      filterTaskDto,
    );
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
    const orgGroup = await this.orgGroupService.getGroup(task.groupId);
    const data = await this.orgMemberService.getOrgAllMembers(orgGroup.orgId);
    const members = data.members.map((member) => member.memberId);
    if (
      !(
        (members.length > 0 && members.includes(userId)) ||
        (orgGroup && orgGroup.org.ownerId === userId)
      )
    ) {
      throw new UnauthorizedException(
        'Only Task Creator or Group Members and Admin can update the Task',
      );
    }

    const updatedTask = await this.taskService.updateTask(id, updateTaskDto);
    return { message: 'Task Updated successfully', task: updatedTask };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove  Task' })
  @UseGuards(AuthGuard, TaskGuard)
  async removeTask(@Param('id') id: number) {
    const task = await this.taskService.getTaskById(id);
    if (!task) {
      throw new NotFoundException('Task Not Found');
    }

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
    const members = task.TaskAsignee.map((assignee) => assignee.memberId);
    if (!members.includes(memberId)) {
      throw new UnauthorizedException('Member Not Assigned to Task');
    }
    await this.taskService.removeTaskAssign(id, memberId);
    return {
      message: 'Member Removed From Assigned Task successfully',
    };
  }
}
