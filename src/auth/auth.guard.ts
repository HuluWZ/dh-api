import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const [type, token] = (request.headers.authorization || '').split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid token or authorization format');
    }

    try {
      const payload = await this.authService.verifyToken(token);
      const user = await this.authService.getProfileById(payload.sub);
      request.user = user;
    } catch (e: any) {
      throw new UnauthorizedException('Invalid token ', e);
    }

    return true;
  }
}
