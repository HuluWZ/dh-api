import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
  Get,
  Param,
  UseGuards,
  Req,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendOtpDto, VerifyOtpDto, verifyPhoneChange } from './dto/otp.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { formatPhone } from 'phone-formater-eth';
import { User } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { DeviceService } from 'src/common/device/device.service';
import phone from 'phone';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly deviceService: DeviceService,
  ) {}

  @Post('send-otp')
  @ApiOperation({ summary: 'Send OTP to phone number' })
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    try {
      await this.authService.sendOtp(sendOtpDto);
      return { message: 'OTP sent successfully' };
    } catch {
      throw new BadRequestException('Invalid phone number');
    }
  }

  @Post('request-phone-change')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Request Phone Change' })
  async requestPhoneChange(@Req() req: any, @Body() phoneChange: SendOtpDto) {
    const userId: number = req.user.id;
    const { isValid, phoneNumber } = phone(phoneChange.phone);
    if (!isValid) {
      throw new BadRequestException('Invalid phone number');
    }
    const isExist = await this.authService.findUserByPhone(phoneNumber);
    if (isExist && isExist.id !== userId) {
      throw new BadRequestException('Phone number already exist');
    }

    await this.authService.requestPhoneChange(userId, phoneNumber);
    return { message: 'OTP sent to new phone successfully' };
  }

  @Post('verify-phone-change')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Verify Phone Change' })
  async verifyPhoneChange(
    @Req() req: any,
    @Body() verifyPhoneChange: verifyPhoneChange,
  ) {
    const userId: number = req.user.id;
    const { isValid, phoneNumber } = phone(verifyPhoneChange.phone);
    if (!isValid) {
      throw new BadRequestException('Invalid phone number');
    }
    const isExist = await this.authService.findUserByPhone(phoneNumber);
    verifyPhoneChange.phone = phoneNumber;
    if (isExist) {
      throw new BadRequestException('Phone number already exist');
    }
    const user = await this.authService.verifyPhoneChange(
      userId,
      verifyPhoneChange,
    );
    return { user, message: 'Phone Changed successfully' };
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP and get access token' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const result = await this.authService.verifyOtp(verifyOtpDto);
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      sessionId: result.sessionId,
      user: result.user,
      isActive: result.isActive,
    };
  }

  @Post('complete-profile')
  @ApiOperation({ summary: 'Complete user profile' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file')) // Apply the FileInterceptor
  async completeProfile(
    @Req() request,
    @Body() completeProfileDto: CompleteProfileDto,
    @UploadedFile() file?: Express.Multer.File, // Get the uploaded file
  ) {
    const id = request.user.id;
    const { file: updateFile, ...others } = completeProfileDto;
    const updatedUser = await this.authService.completeProfile(
      id,
      others,
      file,
    );
    return { message: 'Profile updated successfully', user: updatedUser };
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  async getAllUsers() {
    return this.authService.getAllUsers();
  }
  @Get('search')
  @ApiOperation({ summary: 'Search Users' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async searchOrgs(@Query('search') search: string) {
    return this.authService.searchUser(search);
  }

  @Get('user/:phone')
  @ApiOperation({ summary: 'Get user by phone number' })
  async getUserByPhone(@Param('phone') phone: string) {
    try {
      const formattedPhone = formatPhone(phone);
      if (formattedPhone === 'INVALID_PHONE_NUMBER') {
        throw new Error(`Invalid phone number : ${phone}`);
      }

      return this.authService.getUserByPhone(phone);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('User not found');
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
  @Get('user/:userName')
  @ApiOperation({ summary: 'Get user by userName' })
  async getUserByUsername(@Param('userName') userName: string) {
    const user = await this.authService.getUserByUsername(userName);
    if (!user) {
      throw new NotFoundException(`No User found under @${userName}`);
    }
    return this.authService.getUserByUsername(userName);
  }

  @Get('get/me')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get My profile' })
  @ApiBearerAuth()
  async getMe(@Req() request) {
    try {
      const id = request.user.id;
      const updatedUser = await this.authService.getMe(id);
      return { user: updatedUser };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('User not found');
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
  @Get('/logout')
  @ApiOperation({ summary: 'Logout' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async logOut(@Req() request) {
    const user: User = request.user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    await this.deviceService.deleteDeviceByUserId(user.id);
    return { message: 'User logged out successfully!' };
  }

  @Get('user/find/:phone')
  @ApiOperation({ summary: 'Check If User Exist By Phone Number' })
  async checkIfUserExist(@Param('phone') phone: string) {
    const formattedPhone = formatPhone(phone);
    return this.authService.checkIfUserExistByPhone(formattedPhone);
  }
}
