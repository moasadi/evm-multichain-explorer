import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface ExplorerConfig {
  rpcUrl: string;
  usdtContractAddress: string;
}

@Injectable()
export class ExplorerService {
  private readonly explorerConfigs: { [key: string]: ExplorerConfig };

  constructor(private configService: ConfigService) {
    this.explorerConfigs = {
      bsc: {
        rpcUrl: this.configService.get<string>('BSC_RPC_URL'),
        usdtContractAddress:
          this.configService.get<string>('BSC_USDT_CONTRACT'),
      },
      eth: {
        rpcUrl: this.configService.get<string>('ETH_RPC_URL'),
        usdtContractAddress:
          this.configService.get<string>('ETH_USDT_CONTRACT'),
      },
      polygon: {
        rpcUrl: this.configService.get<string>('POLYGON_RPC_URL'),
        usdtContractAddress: this.configService.get<string>(
          'POLYGON_USDT_CONTRACT',
        ),
      },
    };
  }
  async getUSDTAssetsByChain(address: string, chain: string) {
    const config = this.explorerConfigs[chain];
    if (!config) {
      throw new HttpException(
        `Chain ${chain} is not supported`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.getUSDTBalance(address, config);
  }
  async getUSDTAssets(address: string) {
    const assets = {};
    for (const [network, config] of Object.entries(this.explorerConfigs)) {
      try {
        assets[network] = await this.getUSDTBalance(address, config);
      } catch (error) {
        this.logger.error(
          `Failed to fetch USDT assets for network ${network}: ${error.message}`,
        );
        throw new HttpException(
          `Failed to fetch USDT assets for network ${network}: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
    return assets;
  }

  private async getUSDTBalance(address: string, config: ExplorerConfig) {
    try {
      const response = await axios.post(
        config.rpcUrl,
        {
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [
            {
              to: config.usdtContractAddress,
              data: `0x70a08231${address.slice(2).padStart(64, '0')}`,
            },
            'latest',
          ],
          id: 1,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      const balance = parseInt(response.data.result, 16);
      const formattedBalance = this.formatUSDTBalance(balance);
      return formattedBalance;
    } catch (error) {
      this.logger.error(`Failed to fetch USDT balance: ${error.message}`);
      throw new HttpException(
        `Failed to fetch USDT balance: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private formatUSDTBalance(balance: number): string {
    const formattedBalance = (balance / 1e6).toFixed(2);
    return formattedBalance;
  }

  private get logger() {
    return console;
  }
}
