import { Test, TestingModule } from '@nestjs/testing';
import { BackupSettingService } from './backup-setting.service';

describe('BackupSettingService', () => {
  let service: BackupSettingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BackupSettingService],
    }).compile();

    service = module.get<BackupSettingService>(BackupSettingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
