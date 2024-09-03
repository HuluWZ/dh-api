import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { authorization }: any = request.headers;
    if (!authorization || authorization.trim() === '') {
      throw new UnauthorizedException('Please provide token');
    }
    const [bearer, token] = authorization.split(' ');
    if (bearer.toLowerCase() !== 'bearer' || !token) {
      throw new UnauthorizedException('Invalid token');
    }
    const resp = await this.authService.validateToken(token);
    if (!resp) {
      throw new UnauthorizedException('Unauthorized Access');
    }
    const user: { id: number; phone: string } = {
      id: resp.sub,
      phone: resp.phone,
    };
    request.user = user;
    return true;
  }
}
