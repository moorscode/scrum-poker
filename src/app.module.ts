import { Module } from '@nestjs/common';
import { PokersModule } from './pokers/pokers.module';
import { VotesModule } from './votes/votes.module';
import { PointsService } from './points/points.service';

@Module({
  imports: [PokersModule, VotesModule],
  controllers: [],
  providers: [PointsService],
})
export class AppModule {}
