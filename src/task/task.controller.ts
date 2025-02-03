import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { MinioFileUploadService } from 'src/minio/minio.service';
import { OrgGroupService } from 'src/org-group/org-group.service';
import { OrgMemberService } from 'src/org-member/org-member.service';
import {
  FilterTaskByDateScheduledAssignedToMeDto,
  FilterTaskDto,
} from './dto/filter-task.dto';
import { CreateTaskDto, ReorderTasksDto, UpdateTaskDto } from './dto/task.dto';
import { TaskService } from './task.service';

@ApiTags('Task')
@ApiBearerAuth()
@Controller('tasks')
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly orgGroupService: OrgGroupService,
    private readonly orgMemberService: OrgMemberService,
    private readonly minioService: MinioFileUploadService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create Task' })
  @UseGuards(AuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file')) // Apply the FileInterceptor
  async addOrgMemberToGroup(
    @Body() createTaskDto: CreateTaskDto,
    @Req() req: any,
    @UploadedFile() file?: Express.Multer.File, // Get the uploaded file
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
    let path = null;
    if (file) {
      let { path } = await this.minioService.uploadSingleFile(file, 'public');
    }
    console.log({file,path})
    const task = await this.taskService.createTask(
      createTaskDto,
      createdBy,
      path,
    );
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
  @Post(':archivedId/unarchive')
  @ApiOperation({ summary: 'Reorder Tasks' })
  @UseGuards(AuthGuard)
  async reorderTasks(@Req() req: any, @Body() reorderTasks: ReorderTasksDto) {
    const userId: number = req.user.id;
    const task = await this.taskService.reorderTasks(reorderTasks.taskIds);
    return { message: 'Task Reordered successfully', task: task };
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
  @Get('filter')
  @ApiQuery({ name: 'today', required: false, type: Boolean })
  @ApiQuery({ name: 'assignedToMe', required: false, type: Boolean })
  @ApiQuery({ name: 'scheduled', required: false, type: Boolean })
  @ApiOperation({ summary: 'Filter Tasks' })
  @UseGuards(AuthGuard)
  async filterTask(
    @Req() req: any,
    @Query() filterTaskDto: FilterTaskByDateScheduledAssignedToMeDto,
  ) {
    const userId: number = req.user.id;
    const memberIds = await this.orgGroupService.getMyGroups(userId);
    return this.taskService.filterTasks(filterTaskDto, userId, memberIds);
  }
  @Get('search')
  @ApiOperation({ summary: 'Search Tasks ' })
  @UseGuards(AuthGuard)
  async searchTask(@Query('search') search: string, @Req() req: any) {
    // const userId: number = req.user.id;
    return this.taskService.searchTasks(search);
  }
  @Get('mention')
  @ApiOperation({ summary: 'Mention Tasks  With @task  ' })
  @UseGuards(AuthGuard)
  async mentionTask(@Query('content') content: string, @Req() req: any) {
    const identifier = extractTaskIdentifier(content);
    const userId: number = req.user.id;
    return this.taskService.validateTaskMention(identifier, userId);
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
