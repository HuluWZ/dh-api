import { Test, TestingModule } from '@nestjs/testing';
import { OrgMemberController } from './org-member.controller';

describe('OrgMemberController', () => {
  let controller: OrgMemberController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrgMemberController],
    }).compile();

    controller = module.get<OrgMemberController>(OrgMemberController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
