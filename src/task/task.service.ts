import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';
import { OrgGroupService } from 'src/org-group/org-group.service';

@Injectable()
export class TaskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orgGroupService: OrgGroupService,
  ) {}

  async isAlreadyTaskAssigned(taskId: number, memberId: number) {
    return this.prisma.taskAsignee.findFirst({
      where: { taskId, memberId },
    });
  }

  async createTask(taskDataDto: CreateTaskDto, createdBy: number) {
    const { assignedTo, ...taskData } = taskDataDto;
    const task = await this.prisma.task.create({
      data: { ...taskData, createdBy },
    });
    if (task) {
      const assignes = await this.prisma.taskAsignee.createMany({
        data: assignedTo.map((memberId) => ({
          taskId: task.id,
          memberId,
        })),
      });
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
        TaskAsignee: {
          select: {
            memberId: true,
            member: {
              select: { firstName: true, lastName: true, phone: true },
            },
          },
        },
      },
    });
  }

  async getTaskByGroupId(groupId: number, filterTaskDto: FilterTaskDto) {
    const { status, priority } = filterTaskDto;
    const where = {
      ...(status && { status }),
      ...(priority && { priority }),
      groupId,
    };

    return this.prisma.task.findMany({
      where,
      include: {
        TaskAsignee: {
          select: {
            memberId: true,
            member: {
              select: { firstName: true, lastName: true, phone: true },
            },
          },
        },
      },
    });
  }

  async getAllTasks(filterTaskDto: FilterTaskDto) {
    const { status, priority } = filterTaskDto;
    const where = {
      ...(status && { status }),
      ...(priority && { priority }),
    };

    return this.prisma.task.findMany({
      where,
      include: {
        TaskAsignee: {
          select: {
            memberId: true,
            member: {
              select: { firstName: true, lastName: true, phone: true },
            },
          },
        },
      },
    });
  }

  async getMyCreatedTasks(createdBy: number) {
    return this.prisma.task.findMany({
      where: { createdBy },
      include: {
        TaskAsignee: {
          select: {
            memberId: true,
            member: {
              select: { firstName: true, lastName: true, phone: true },
            },
          },
        },
      },
    });
  }
  async getMyAssignedTasks(memberId: number) {
    return this.prisma.taskAsignee.findMany({
      where: { memberId },
      include: {
        task: {
          include: {
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

  async updateTask(taskId: number, updateTask: UpdateTaskDto) {
    const task = await this.getTaskById(taskId);
    const { assignedTo, groupId, ...update } = updateTask;
    const orgGroup = await this.orgGroupService.getGroup(task.groupId);
    const members = orgGroup.OrgGroupMember.map((member) => member.memberId);

    const invalidMembers = updateTask.assignedTo.filter(
      (memberId) => !members.includes(memberId),
    );
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
      await prisma.task.delete({ where: { id: taskId } });
    });
  }

  async removeTaskAssign(taskId: number, memberId: number) {
    return this.prisma.taskAsignee.delete({
      where: { taskId_memberId: { taskId, memberId } },
    });
  }
}
