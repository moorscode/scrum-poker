import { Module } from '@nestjs/common';
import { PokersModule } from './pokers/pokers.module';
import { PointsService } from './points/points.service';
import { PokersRoomsService } from './pokers/pokers-rooms.service';

@Module({
  imports: [PokersModule],
  controllers: [],
  providers: [PointsService, PokersRoomsService],
})
export class AppModule {}
