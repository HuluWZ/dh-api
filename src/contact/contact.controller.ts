import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { ContactService } from './contact.service';
import { CreateContactDto, UpdateContactDto } from './dto/contact.dto';

@ApiTags('User Contacts')
@ApiBearerAuth()
@Controller('contacts')
@UseGuards(AuthGuard)
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Post()
  @ApiOperation({ summary: 'Create Contact' })
  async createContact(
    @Body() createContactDto: CreateContactDto,
    @Req() req: any,
  ) {
    const userId: number = req.user.id;
    const contact = await this.contactService.createContact(
      userId,
      createContactDto,
    );
    return { message: 'Contact created successfully', contact };
  }

  @Patch(':contactId')
  @ApiOperation({ summary: 'Update Contact' })
  async updateContact(
    @Param('contactId') contactId: string,
    @Body() updateContactDto: UpdateContactDto,
    @Req() req: any,
  ) {
    const userId: number = req.user.id;
    const contact = await this.contactService.updateContact(
      +contactId,
      userId,
      updateContactDto,
    );
    return { message: 'Contact updated successfully', contact };
  }
  @Get('my-contacts')
  @ApiOperation({ summary: 'Get My Contacts' })
  @UseGuards(AuthGuard)
  async getMyContacts(@Req() req: any) {
    const userId: number = req.user.id;
    const myContacts = await this.contactService.getMyContacts(userId);
    return { myContacts };
  }
  @Get('search')
  @ApiOperation({ summary: 'Search My Contact' })
  @UseGuards(AuthGuard)
  async searchOrgs(@Query('search') search: string, @Req() req: any) {
    const userId: number = req.user.id;
    return this.contactService.searchMyContacts(userId, search);
  }

  @Get(':contactId')
  @ApiOperation({ summary: 'Get Contact By Id' })
  @UseGuards(AuthGuard)
  async getGroup(@Param('contactId') contactId: string, @Req() req: any) {
    const userId: number = req.user.id;
    const contact = await this.contactService.findUserContact(
      userId,
      +contactId,
    );
    return { contact };
  }

  @Delete(':contactId')
  @ApiOperation({ summary: 'Delete Contact' })
  @UseGuards(AuthGuard)
  async deleteOrgInvite(
    @Param('contactId') contactId: string,
    @Req() req: any,
  ) {
    const userId: number = req.user.id;
    const deleteContact = await this.contactService.deleteContact(
      userId,
      +contactId,
    );
    return { deleteContact, message: 'Contact deleted successfully' };
  }
}
