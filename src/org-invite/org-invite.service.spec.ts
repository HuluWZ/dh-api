import { Test, TestingModule } from '@nestjs/testing';
import { OrgInviteService } from './org-invite.service';

describe('OrgInviteService', () => {
  let service: OrgInviteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrgInviteService],
    }).compile();

    service = module.get<OrgInviteService>(OrgInviteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
