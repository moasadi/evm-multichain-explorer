import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import BigNumber from 'bignumber.js';

interface ExplorerConfig {
  rpcUrl: string;
  usdtContractAddress: string;
  decimals: number;
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
        decimals: 18,
      },
      eth: {
        rpcUrl: this.configService.get<string>('ETH_RPC_URL'),
        usdtContractAddress:
          this.configService.get<string>('ETH_USDT_CONTRACT'),
        decimals: 6,
      },
      polygon: {
        rpcUrl: this.configService.get<string>('POLYGON_RPC_URL'),
        usdtContractAddress: this.configService.get<string>(
          'POLYGON_USDT_CONTRACT',
        ),
        decimals: 6,
      },
    };
  }

  async getUSDTAssets(address: string) {
    const assets = {};
    for (const [network, config] of Object.entries(this.explorerConfigs)) {
      try {
        assets[network] = await this.getUSDTBalance(address, config);
      } catch (error) {
        console.error(
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

  async getUSDTAssetsByChain(address: string, chain: string) {
    const config = this.explorerConfigs[chain];
    if (!config) {
      throw new HttpException(
        `Chain ${chain} is not supported`,
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      return await this.getUSDTBalance(address, config);
    } catch (error) {
      console.error(
        `Failed to fetch USDT assets for network ${chain}: ${error.message}`,
      );
      throw new HttpException(
        `Failed to fetch USDT assets for network ${chain}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
      const balance = new BigNumber(response.data.result);
      const formattedBalance = this.formatUSDTBalance(balance, config.decimals);
      return formattedBalance;
    } catch (error) {
      console.error(`Failed to fetch USDT balance: ${error.message}`);
      throw new HttpException(
        `Failed to fetch USDT balance: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private formatUSDTBalance(balance: BigNumber, decimals: number): string {
    const divisor = new BigNumber(10).pow(decimals);
    return balance.dividedBy(divisor).toFixed(2);
  }
}
