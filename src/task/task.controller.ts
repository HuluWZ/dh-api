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
  @UseGuards(AuthGuard)
  async addOrgMemberToGroup(
    @Body() createTaskDto: CreateTaskDto,
    @Req() req: any,
  ) {
    const createdBy: number = req.user.id;
    const orgGroup = await this.orgGroupService.getGroup(createTaskDto.groupId);
    if (!orgGroup) {
      throw new NotFoundException('Group Not Found');
    }
    let members = [];
    let groupMembers = [];
    if (orgGroup.orgId) {
      const data = await this.orgMemberService.getOrgAllMembers(orgGroup.orgId);
      members = data.members.map((member) => member.memberId);
      if (
        !(
          (members.length > 0 && members.includes(createdBy)) ||
          (orgGroup && orgGroup.org.ownerId === createdBy) ||
          (orgGroup && orgGroup.personal.id === createdBy)
        )
      ) {
        throw new UnauthorizedException(
          'You are not the member or owner of the group',
        );
      }
    } else {
      groupMembers = orgGroup.OrgGroupMember.map((member) => member.memberId);
      if (
        !(
          (groupMembers.length > 0 && groupMembers.includes(createdBy)) ||
          (orgGroup && orgGroup.personal.id === createdBy)
        )
      ) {
        throw new UnauthorizedException(
          'You are not the member or owner of the group',
        );
      }
    }
    let invalidMembers = [];
    if (orgGroup.orgId) {
      invalidMembers = createTaskDto.assignedTo.filter(
        (memberId) => !members.includes(memberId),
      );
    } else {
      invalidMembers = createTaskDto.assignedTo.filter(
        (memberId) => !groupMembers.includes(memberId),
      );
    }
    if (invalidMembers.length > 0) {
      throw new UnauthorizedException(
        'Invalid Members in assignedTo, Please check the members',
      );
    }
    const task = await this.taskService.createTask(createTaskDto, createdBy);
    return { message: 'Task Created successfully', task };
  }
  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive Task' })
  @UseGuards(AuthGuard)
  async archiveTask(@Req() req: any, @Param('id') id: number) {
    const userId: number = req.user.id;
    const task = await this.taskService.getTaskById(id);
    if (!task) {
      throw new NotFoundException('Task Not Found');
    }
    const isTaskArchived = await this.taskService.isTaskArchived(userId, id);
    if (isTaskArchived) {
      throw new UnauthorizedException('Task Already Archived By User');
    }
    const archivedTask = await this.taskService.archiveTask(userId, id);
    return { message: 'Task Archived successfully', task: archivedTask };
  }
  @Post(':archivedId/unarchive')
  @ApiOperation({ summary: 'Unarchive Task' })
  @UseGuards(AuthGuard)
  async unarchiveTask(
    @Req() req: any,
    @Param('archivedId') archivedId: number,
  ) {
    const userId: number = req.user.id;
    const archivedTask = await this.taskService.getArchivedTaskById(archivedId);
    if (!archivedTask) {
      throw new UnauthorizedException('Archived Task not found');
    }
    if (archivedTask.userId !== userId) {
      throw new UnauthorizedException('You are not authorized to unarchive');
    }
    const task = await this.taskService.unArchiveTask(archivedId);
    return { message: 'Task UnArchived successfully', task: task };
  }

  @Post('assign/:taskId/:memberId')
  @ApiOperation({ summary: 'Assign Member Task' })
  @UseGuards(AuthGuard)
  async AssignTask(
    @Req() req: any,
    @Param('taskId') taskId: number,
    @Param('memberId') memberId: number,
  ) {
    const createdBy: number = req.user.id;

    const task = await this.taskService.getTaskById(taskId);
    if (!task) {
      throw new NotFoundException('Task Not Found');
    }
    const orgGroup = await this.orgGroupService.getGroup(task.groupId);
    let members = [];
    let groupMembers = [];
    if (orgGroup.orgId) {
      const data = await this.orgMemberService.getOrgAllMembers(orgGroup.orgId);
      members = data.members.map((member) => member.memberId);
      if (
        !(
          (members.length > 0 && members.includes(createdBy)) ||
          (orgGroup && orgGroup.org.ownerId === createdBy) ||
          (orgGroup && orgGroup.personal.id === createdBy)
        )
      ) {
        throw new UnauthorizedException(
          'You are not the member or owner of the group',
        );
      }
    } else {
      groupMembers = orgGroup.OrgGroupMember.map((member) => member.memberId);
      if (
        !(
          (groupMembers.length > 0 && groupMembers.includes(createdBy)) ||
          (orgGroup && orgGroup.personal.id === createdBy)
        )
      ) {
        throw new UnauthorizedException(
          'You are not the member or owner of the group',
        );
      }
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
  @UseGuards(AuthGuard)
  async getAll(@Query() filterTaskDto: FilterTaskDto) {
    return this.taskService.getAllTasks(filterTaskDto);
  }
  @Get('search')
  @ApiOperation({ summary: 'Search Tasks ' })
  @UseGuards(AuthGuard)
  async searchTask(@Query('search') search: string, @Req() req: any) {
    // const userId: number = req.user.id;
    return this.taskService.searchTasks(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Task By Id' })
  @UseGuards(AuthGuard)
  async getTaskById(@Param('id') id: string) {
    const task = await this.taskService.getTaskById(+id);
    return { task };
  }
  @Get('group/:groupId')
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'priority', required: false, type: String })
  @ApiOperation({ summary: 'Get Task By Group' })
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
  async getMyTasks(@Req() req: any) {
    const memberId: number = req.user.id;
    const myAssigned = await this.taskService.getMyAssignedTasks(memberId);
    return { myAssigned: myAssigned.map((task) => task.task) };
  }
  @Get('my/archived')
  @ApiOperation({ summary: 'Get My Archived Tasks' })
  @UseGuards(AuthGuard)
  async getMyArchivedTasks(@Req() req: any) {
    const userId: number = req.user.id;
    const archivedTasks = await this.taskService.getMyArchivedTasks(userId);
    return { archivedTasks };
  }
  @Get('my/created')
  @ApiOperation({ summary: 'Get Tasks I Created' })
  @UseGuards(AuthGuard)
  async getTasksCreatedByMe(@Req() req: any) {
    const memberId: number = req.user.id;
    const tasks = await this.taskService.getMyCreatedTasks(memberId);
    return { tasks };
  }

  @Patch('update/:id')
  @ApiOperation({ summary: 'Update Task By Id' })
  @UseGuards(AuthGuard)
  async updateTask(
    @Req() req: any,
    @Body() updateTaskDto: UpdateTaskDto,
    @Param('id') id: number,
  ) {
    const createdBy: number = req.user.id;
    const task = await this.taskService.getTaskById(id);
    if (!task) {
      throw new NotFoundException('Task Not Found');
    }
    const orgGroup = await this.orgGroupService.getGroup(task.groupId);
    let members = [];
    let groupMembers = [];
    if (orgGroup.orgId) {
      const data = await this.orgMemberService.getOrgAllMembers(orgGroup.orgId);
      members = data.members.map((member) => member.memberId);
      if (
        !(
          (members.length > 0 && members.includes(createdBy)) ||
          (orgGroup && orgGroup.org.ownerId === createdBy) ||
          (orgGroup && orgGroup.personal.id === createdBy)
        )
      ) {
        throw new UnauthorizedException(
          'You are not the member or owner of the group to Update',
        );
      }
    } else {
      groupMembers = orgGroup.OrgGroupMember.map((member) => member.memberId);
      if (
        !(
          (groupMembers.length > 0 && groupMembers.includes(createdBy)) ||
          (orgGroup && orgGroup.personal.id === createdBy)
        )
      ) {
        throw new UnauthorizedException(
          'You are not the member or owner of the group to Update',
        );
      }
    }

    const updatedTask = await this.taskService.updateTask(
      id,
      updateTaskDto,
      createdBy,
    );
    return { message: 'Task Updated successfully', task: updatedTask };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove  Task' })
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
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
