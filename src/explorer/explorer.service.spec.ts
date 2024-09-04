import { Test, TestingModule } from '@nestjs/testing';
import { ExplorerService } from './explorer.service';

describe('ExplorerService', () => {
  let service: ExplorerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExplorerService],
    }).compile();

    service = module.get<ExplorerService>(ExplorerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return USDT assets', () => {
    const address = '0x1234567890abcdef';
    expect(service.getUSDTAssets(address)).toBe(
      `This action returns all USDT assets from address: ${address}`,
    );
  });
});
