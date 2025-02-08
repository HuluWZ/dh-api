import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class PrivateChatGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToWs();
    const client = ctx.getClient();
    console.log({ client: client.handshake });
    try {
      const token =
        client.handshake.headers.authorization &&
        client.handshake.headers?.authorization?.split(' ')[1];
      console.log({ token });

      if (!token) {
        throw new UnauthorizedException('Token not provided');
      }

      const resp = await this.authService.validateToken(token);
      if (!resp) {
        throw new UnauthorizedException('Invalid or Expired Token');
      }

      const user = await this.authService.getMe(+resp.sub);
      client['user'] = user;
      return true;
    } catch (error) {
      console.error('Error in canActivate:', error.message);
      throw new UnauthorizedException(error.message);
    }
  }
}
