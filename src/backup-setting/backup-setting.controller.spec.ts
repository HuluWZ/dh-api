import { Test, TestingModule } from '@nestjs/testing';
import { BackupSettingController } from './backup-setting.controller';

describe('BackupSettingController', () => {
  let controller: BackupSettingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BackupSettingController],
    }).compile();

    controller = module.get<BackupSettingController>(BackupSettingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
