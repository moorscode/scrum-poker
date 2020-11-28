import { Module } from '@nestjs/common';
import { PokersModule } from './pokers/pokers.module';
import { PointsService } from './points/points.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot(), PokersModule],
  controllers: [],
  providers: [PointsService],
})
export class AppModule {}
