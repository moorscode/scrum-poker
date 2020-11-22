import { Module } from '@nestjs/common';
import { PokersModule } from './pokers/pokers.module';
import { PointsService } from './points/points.service';

@Module({
  imports: [PokersModule],
  controllers: [],
  providers: [PointsService],
})
export class AppModule {}
