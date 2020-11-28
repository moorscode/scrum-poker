import { Module } from '@nestjs/common';
import { PokersService } from './pokers.service';
import { PokersGateway } from './pokers.gateway';
import { PokersRoomsService } from './pokers-rooms.service';

@Module({
  providers: [PokersGateway, PokersService, PokersRoomsService],
})
export class PokersModule {}
