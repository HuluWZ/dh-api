import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { OrgService } from 'src/org/org.service';

@Injectable()
export class OrgGroupGuard implements CanActivate {
  constructor(private readonly orgService: OrgService) {}
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
    request.orgs = orgs.length ? orgs.map((org) => org.id) : [];
    return true;
  }
}
