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
    const orgs = await this.orgService.getMyOrgs(+resp.id);
    const orgMember = await this.orgMemberService.getOrgMember(
      createOrgGroupMemberDto.memberId,
    );
    if (!orgMember.length) {
      throw new UnauthorizedException('Invalid Member');
    }
    const orgGroup = await this.orgGroupService.getGroup(
      createOrgGroupMemberDto.groupId,
    );
    if (!orgGroup) {
      throw new UnauthorizedException('Invalid Org Group');
    }
    if (!orgMember.map((org) => org.orgId).includes(orgGroup.orgId)) {
      throw new UnauthorizedException('Invalid Org Data');
    }

    request.orgs = orgs.length ? orgs.map((org) => org.id) : [];
    request.orgMember = orgMember;
    request.orgGroup = orgGroup;
    request.orgId = orgGroup.orgId;
    return true;
  }
}
