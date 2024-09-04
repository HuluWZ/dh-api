import { Test, TestingModule } from '@nestjs/testing';
import { OrgInviteController } from './org-invite.controller';

describe('OrgInviteController', () => {
  let controller: OrgInviteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrgInviteController],
    }).compile();

    controller = module.get<OrgInviteController>(OrgInviteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
