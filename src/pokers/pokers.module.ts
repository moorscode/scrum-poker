import { Module } from '@nestjs/common';
import { PokersService } from './pokers.service';
import { PokersGateway } from './pokers.gateway';

@Module({
  providers: [PokersGateway, PokersService],
})
export class PokersModule {}
