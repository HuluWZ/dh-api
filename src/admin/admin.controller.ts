import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Get,
  Param,
  UseGuards,
  Delete,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from 'src/auth/auth.service';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';
import { CreateAdminDto } from './dto/admin.dto';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly authService: AuthService,
  ) {}

  @Post('create-admin')
  @ApiOperation({ summary: 'Create Admin' })
  @UseGuards(AuthGuard)
  // @UseGuards(AuthGuard, AdminGuard)
  async createAdmin(@Body() adminDto: CreateAdminDto) {
    const isAdminAlready = await this.adminService.getAdmins(adminDto.userId);
    if (isAdminAlready) {
      throw new UnauthorizedException('Admin Already Exist');
    }
    await this.adminService.createAdmin(adminDto);
    return { message: 'Admin Created successfully' };
  }
  @Patch('approve-profile/:userId')
  @ApiOperation({ summary: 'Approve Profile' })
  @UseGuards(AuthGuard, AdminGuard)
  async approveProfile(@Param('userId') userId: string) {
    const user = await this.authService.getMe(+userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (user.isVerified) {
      throw new UnauthorizedException('User is already verified');
    }
    if (!user.profile) {
      throw new UnauthorizedException('User must have profile to be approved');
    }
    return this.adminService.approveProfile(+userId);
  }
  @Get('all')
  @ApiOperation({ summary: 'Get All Admin' })
  @UseGuards(AuthGuard, AdminGuard)
  async getAllAdmin() {
    return this.adminService.getAllAdmins();
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get Admin By  User Id' })
  @UseGuards(AuthGuard)
  async getOne(@Param('userId') userId: string) {
    return this.adminService.getAdmins(+userId);
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Delete Admin By  User Id' })
  @UseGuards(AuthGuard, AdminGuard)
  async deleteAdmin(@Param('userId') userId: string) {
    return this.adminService.removeAdmin(+userId);
  }
}
