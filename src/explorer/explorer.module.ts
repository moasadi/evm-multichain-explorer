import { Module } from '@nestjs/common';
import { ExplorerService } from './explorer.service';
import { ExplorerController } from './explorer.controller';

@Module({
  providers: [ExplorerService],
  controllers: [ExplorerController],
})
export class ExplorerModule {}
