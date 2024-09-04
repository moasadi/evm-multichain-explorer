import { Test, TestingModule } from '@nestjs/testing';
import { ExplorerController } from './explorer.controller';
import { ExplorerService } from './explorer.service';

describe('ExplorerController', () => {
  let controller: ExplorerController;
  let service: ExplorerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExplorerController],
      providers: [ExplorerService],
    }).compile();

    controller = module.get<ExplorerController>(ExplorerController);
    service = module.get<ExplorerService>(ExplorerService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return USDT assets', () => {
    const address = '0x1234567890abcdef';
    jest
      .spyOn(service, 'getUSDTAssets')
      .mockImplementation(
        async () =>
          `This action returns all USDT assets from address: ${address}`,
      );
    expect(controller.getUSDTAssets(address)).toBe(
      `This action returns all USDT assets from address: ${address}`,
    );
  });
});
