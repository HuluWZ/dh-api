import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { OrgService } from 'src/org/org.service';
import { OrgInviteService } from './org-invite.service';

@Injectable()
export class OrgInviteGuard implements CanActivate {
  constructor(
    private readonly orgService: OrgService,
    private readonly orgInviteService: OrgInviteService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.user) {
      throw new UnauthorizedException('Invalid User');
    }
    const resp = request.user;
    // if (resp.profile && resp.isVerified === false) {
    //   throw new UnauthorizedException('User is not verified');
    // }

    const orgs = await this.orgService.getMyOrgs(+resp.id);
    const invites = await this.orgInviteService.getMyInvitees(+resp.id);
    const allOrgs = orgs.length ? orgs.map((org) => org.id) : [];
    const allInvites = invites.length
      ? invites.map((invite) => invite.orgId)
      : [];
    if (!allOrgs.length && !allInvites.length) {
      throw new UnauthorizedException("You can't perform this action");
    }
    request.orgs = allOrgs;
    request.invites = allInvites;
    return true;
  }
}
