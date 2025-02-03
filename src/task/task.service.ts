import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import {
  FilterTaskByDateScheduledAssignedToMeDto,
  FilterTaskDto,
} from './dto/filter-task.dto';
import { OrgGroupService } from 'src/org-group/org-group.service';
import { OrgMemberService } from 'src/org-member/org-member.service';

@Injectable()
export class TaskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orgGroupService: OrgGroupService,
    private readonly orgMemberService: OrgMemberService,
  ) {}

  async isAlreadyTaskAssigned(taskId: number, memberId: number) {
    return this.prisma.taskAsignee.findFirst({
      where: { taskId, memberId },
    });
  }

  async createTask(
    taskDataDto: CreateTaskDto,
    createdBy: number,
    voice_note: string | null,
  ) {
    const { assignedTo, file, ...taskData } = taskDataDto;
    console.log(' File Form ', file);
    if (taskData.parentId) {
      const parentTask = await this.getTaskById(taskData.parentId);
      if (!parentTask) {
        throw new UnauthorizedException('Invalid Parent Task Id');
      }
    }
    const task = await this.prisma.task.create({
      data: { ...taskData, createdBy, voice_note },
    });
    if (task) {
      let assignes;
      if (assignedTo.length) {
        assignes = await this.prisma.taskAsignee.createMany({
          data: assignedTo.map((memberId) => ({
            taskId: task.id,
            memberId,
          })),
        });
      }
      return { ...task, assignee: assignes };
    }
  }

  async addTaskAssignee(taskId: number, memberId: number) {
    return this.prisma.taskAsignee.create({
      data: { taskId, memberId },
    });
  }

  async getTaskById(taskId: number) {
    return this.prisma.task.findFirst({
      where: { id: taskId },
      include: {
        parent: true,
        subtasks: true,
        TaskAsignee: {
          select: {
            memberId: true,
            member: {
              select: { firstName: true, lastName: true, phone: true },
            },
          },
        },
      },
      orderBy: [{ position: 'asc' }, { updatedAt: 'desc' }],
    });
  }

  async getTaskByGroupId(groupId: number, filterTaskDto: FilterTaskDto) {
    const { status, priority } = filterTaskDto;
    const where = {
      ...(status && { status }),
      ...(priority && { priority }),
      groupId,
      parentId: null,
    };

    return this.prisma.task.findMany({
      where,
      include: {
        parent: true,
        subtasks: true,
        TaskAsignee: {
          select: {
            memberId: true,
            member: {
              select: { firstName: true, lastName: true, phone: true },
            },
          },
        },
      },
      orderBy: [{ position: 'asc' }, { updatedAt: 'desc' }],
    });
  }

  async getAllTasks(filterTaskDto: FilterTaskDto) {
    const { status, priority } = filterTaskDto;
    const where = {
      ...(status && { status }),
      ...(priority && { priority }),
      parentId: null,
    };

    return this.prisma.task.findMany({
      where,
      include: {
        parent: true,
        subtasks: true,
        TaskAsignee: {
          select: {
            memberId: true,
            member: {
              select: { firstName: true, lastName: true, phone: true },
            },
          },
        },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async filterTasks(
    filterTaskDto: FilterTaskByDateScheduledAssignedToMeDto,
    userId: number,
    groupIds: number[],
  ) {
    const { today, assignedToMe, scheduled } = filterTaskDto;
    const where = {
      ...(groupIds &&
        groupIds.length > 0 &&
        today && {
          createdAt: {
            gte: new Date().toISOString().split('T')[0] + 'T00:00:00.000Z',
            lte: new Date().toISOString().split('T')[0] + 'T23:59:59.999Z',
          },
        }),
      ...(assignedToMe && { TaskAsignee: { every: { memberId: userId } } }),
      ...(scheduled && { deadline: { not: null } }),
      ...(groupIds && groupIds.length > 0 ? { groupId: { in: groupIds } } : {}),
      parentId: null,
    };
    return this.prisma.task.findMany({
      where,
      include: {
        parent: true,
        subtasks: true,
        TaskAsignee: {
          select: {
            memberId: true,
            member: {
              select: { firstName: true, lastName: true, phone: true },
            },
          },
        },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async getMyCreatedTasks(createdBy: number) {
    return this.prisma.task.findMany({
      where: { createdBy },
      include: {
        parent: true,
        subtasks: true,
        TaskAsignee: {
          select: {
            memberId: true,
            member: {
              select: { firstName: true, lastName: true, phone: true },
            },
          },
        },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });
  }
  async getMyAssignedTasks(memberId: number) {
    return this.prisma.taskAsignee.findMany({
      where: { memberId },
      include: {
        task: {
          include: {
            parent: true,
            subtasks: true,
            TaskAsignee: {
              select: {
                memberId: true,
                member: {
                  select: { firstName: true, lastName: true, phone: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async updateTask(
    taskId: number,
    updateTask: UpdateTaskDto,
    createdBy: number,
  ) {
    const task = await this.getTaskById(taskId);
    const { assignedTo, groupId, ...update } = updateTask;
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
    let invalidMembers;
    if (orgGroup.orgId) {
      invalidMembers = updateTask.assignedTo.filter(
        (memberId) => !members.includes(memberId),
      );
    } else {
      invalidMembers = updateTask.assignedTo.filter(
        (memberId) => !groupMembers.includes(memberId),
      );
    }
    if (invalidMembers.length > 0) {
      throw new UnauthorizedException(
        'Invalid Members in assignedTo, Please check the members',
      );
    }

    const existingAssignees = task.TaskAsignee.map(
      (assignee) => assignee.memberId,
    );
    if (assignedTo.length) {
      const newAssignees = assignedTo.filter(
        (assignee) => !existingAssignees.includes(assignee),
      );
      const removedAssignees = existingAssignees.filter(
        (assignee) => !assignedTo.includes(assignee),
      );
      if (newAssignees.length) {
        await this.prisma.taskAsignee.createMany({
          data: newAssignees.map((memberId) => ({
            taskId,
            memberId,
          })),
        });
      }
      if (removedAssignees.length) {
        await this.prisma.taskAsignee.deleteMany({
          where: { taskId, memberId: { in: removedAssignees } },
        });
      }
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: { ...update },
    });
  }

  async removeTask(taskId: number) {
    return await this.prisma.$transaction(async (prisma) => {
      await prisma.taskAsignee.deleteMany({ where: { taskId } });
      await prisma.archivedTasks.deleteMany({ where: { taskId } });
      await prisma.task.delete({ where: { id: taskId } });
    });
  }

  async removeTaskAssign(taskId: number, memberId: number) {
    return this.prisma.taskAsignee.delete({
      where: { taskId_memberId: { taskId, memberId } },
    });
  }
  async searchTasks(search: string) {
    return this.prisma.task.findMany({
      where: {
        OR: [
          { name: { startsWith: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
          { group: { name: { startsWith: search, mode: 'insensitive' } } },
        ],
      },
    });
  }
  async getArchivedTaskById(id: number) {
    return this.prisma.archivedTasks.findUnique({
      where: { id },
    });
  }
  async isTaskArchived(userId: number, taskId: number) {
    return this.prisma.archivedTasks.findFirst({
      where: { userId, taskId },
    });
  }
  async archiveTask(userId: number, taskId: number) {
    return this.prisma.archivedTasks.create({ data: { userId, taskId } });
  }
  async getMyArchivedTasks(userId: number) {
    return this.prisma.archivedTasks.findMany({
      where: { userId },
      include: {
        task: {
          include: {
            group: { select: { name: true, color: true } },
            TaskAsignee: {
              select: {
                memberId: true,
                member: {
                  select: { firstName: true, lastName: true, phone: true },
                },
              },
            },
          },
        },
      },
    });
  }
  async unArchiveTask(archivedId: number) {
    return this.prisma.archivedTasks.delete({ where: { id: archivedId } });
  }
  async reorderTasks(taskIds: number[]) {
    return this.prisma.$transaction(async (prisma) => {
      await Promise.all(
        taskIds.map((taskId, index) =>
          prisma.task.update({
            where: { id: taskId },
            data: { position: index + 1 },
          }),
        ),
      );
    });
  }
  async validateTaskMention(identifier: string | number, userId: number) {
    const isId = typeof identifier === 'number';

    const task = await this.prisma.task.findFirst({
      where: {
        AND: [
          isId
            ? { id: identifier }
            : { name: { contains: identifier, mode: 'insensitive' } },
          {
            OR: [
              { createdBy: userId },
              { group: { OrgGroupMember: { some: { memberId: userId } } } },
            ],
          },
        ],
      },
    });

    return task || null;
  }
}
