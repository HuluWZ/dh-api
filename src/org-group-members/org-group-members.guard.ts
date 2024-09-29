import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { OrgMemberService } from 'src/org-member/org-member.service';
import { OrgService } from 'src/org/org.service';
import { OrgGroupService } from 'src/org-group/org-group.service';
import { CreateOrgGroupMemberDto } from './dto/org-group-members.dto';

@Injectable()
export class OrgGroupMembersGuard implements CanActivate {
  constructor(
    private readonly orgService: OrgService,
    private readonly orgMemberService: OrgMemberService,
    private readonly orgGroupService: OrgGroupService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const createOrgGroupMemberDto: CreateOrgGroupMemberDto = request.body;
    if (!request.user) {
      throw new UnauthorizedException('Invalid User');
    }
    const resp = request.user;
    if (resp.profile && resp.isVerified === false) {
      throw new UnauthorizedException('User is not verified');
    }

    const orgs = await this.orgService.getMyOrgs(+resp.id);
    const orgGroup = await this.orgGroupService.getGroup(
      createOrgGroupMemberDto.groupId,
    );
    if (!orgGroup) {
      throw new UnauthorizedException('Invalid Org Group');
    }
    if (orgGroup.orgId) {
      const orgMember = await this.orgMemberService.getOrgMember(
        createOrgGroupMemberDto.memberId,
        orgGroup.orgId,
      );
      if (!orgMember) {
        throw new UnauthorizedException('Invalid Member');
      }

      request.orgs = orgs.length ? orgs.map((org) => org.id) : [];
      if (!request.orgs.includes(orgGroup.orgId)) {
        throw new UnauthorizedException(
          'Only Org Owner can Add  or remove Member or  Admin',
        );
      }
      request.orgMember = orgMember;
      request.orgId = orgGroup.orgId;
    } else {
      if (orgGroup.createdBy !== +resp.id) {
        throw new UnauthorizedException(
          'Only Org Owner can Add or remove Member or Admin',
        );
      }
      request.personal = orgGroup.personal;
    }
    request.orgGroup = orgGroup;
    request.user = resp;
    return true;
  }
}
