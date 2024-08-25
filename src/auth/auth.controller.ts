import {
  Body,
  Controller,
  Post,
  Put,
  Headers,
  UnauthorizedException,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiBearerAuth()
  @Put('update/:id')
  async updateUser(
    @Headers('Authorization') authorization: string,
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const token = authorization?.split(' ')[1];
    const decoded = await this.authService.verifyToken(token);

    if (!decoded || decoded.sub !== id) {
      throw new UnauthorizedException('Invalid token');
    }

    return this.authService.updateUser(Number(id), updateUserDto);
  }
}
