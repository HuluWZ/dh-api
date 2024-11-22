import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import { CreateContactDto, UpdateContactDto } from './dto/contact.dto';
import phone from 'phone';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrFindContact(phone: string) {
    const contact = await this.prisma.contact.upsert({
      where: { phone },
      update: {},
      create: { phone },
    });
    return contact.id;
  }

  async createContact(userId: number, contact: CreateContactDto) {
    const { phone: phone_number, ...contactData } = contact;
    const { isValid, phoneNumber } = phone(phone_number);
    if (!isValid) {
      throw new BadRequestException(`Invalid Phone Number ${phone_number}.`);
    }
    const contactId = await this.createOrFindContact(phoneNumber);
    const userContact = await this.findUserContact(userId, contactId);
    if (userContact) {
      throw new UnauthorizedException(
        `User Already has the contact #${phoneNumber}.`,
      );
    }
    return this.prisma.userContact.create({
      data: {
        ...contactData,
        userId,
        contactId,
      },
    });
  }
  async findUserContact(userId: number, contactId: number) {
    return this.prisma.userContact.findFirst({ where: { contactId, userId } });
  }
  async getMyContacts(userId: number) {
    return this.prisma.userContact.findMany({
      where: { userId },
      include: {
        contact: {
          select: {
            id: true,
            phone: true,
          },
        },
      },
    });
  }
  async searchMyContacts(userId: number, name: string) {
    return this.prisma.userContact.findMany({
      where: {
        userId,
        OR: [
          {
            contact: {
              OR: [
                { phone: { startsWith: name, mode: 'insensitive' } },
                { phone: { contains: name, mode: 'insensitive' } },
              ],
            },
          },
          { firstName: { startsWith: name, mode: 'insensitive' } },
          { lastName: { startsWith: name, mode: 'insensitive' } },
          { company: { startsWith: name, mode: 'insensitive' } },
          { address: { startsWith: name, mode: 'insensitive' } },
        ],
      },
      include: {
        contact: {
          select: {
            id: true,
            phone: true,
          },
        },
      },
    });
  }
  async getContactById(contactId: number, userId: number) {
    return this.prisma.userContact.findFirst({
      where: { userId, contactId },
    });
  }
  async deleteContact(contactId: number, userId: number) {
    return this.prisma.userContact.delete({
      where: { userId_contactId: { userId, contactId } },
    });
  }
  async updateContact(
    contactId: number,
    userId: number,
    updateContact: UpdateContactDto,
  ) {
    const contact = await this.findUserContact(contactId, userId);
    if (!contact) {
      throw new NotFoundException('Contact Not Found');
    }
    const { phone, ...update } = updateContact;
    return this.prisma.userContact.update({
      where: { userId_contactId: { userId, contactId } },
      data: {
        ...update,
      },
    });
  }
}
