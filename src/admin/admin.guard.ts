import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminService } from './admin.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly adminService: AdminService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    if (!request.user) {
      throw new UnauthorizedException('Invalid User');
    }
    const resp = request.user;
    const admin = await this.adminService.getAdmins(+resp.id);
    if (!admin) {
      throw new UnauthorizedException('Only Admin can perform this action');
    }
    return true;
  }
}
