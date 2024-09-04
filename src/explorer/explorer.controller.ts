import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ExplorerService } from './explorer.service';

@ApiTags('explorer')
@Controller('explorer')
export class ExplorerController {
  constructor(private readonly explorerService: ExplorerService) {}
  @Get('usdt-assets/:address')
  @ApiOperation({ summary: 'Get All USDT Assets From Multichain' })
  getUSDTAssets(@Query('address') address: string) {
    return this.explorerService.getUSDTAssets(address);
  }

  @Get('usdt-assets/')
  @ApiOperation({ summary: 'Get USDT Assets By Chain' })
  getUSDTAssetsByChain(
    @Query('address') address: string,
    @Query('chain') chain: string,
  ) {
    return this.explorerService.getUSDTAssetsByChain(address, chain);
  }
}
