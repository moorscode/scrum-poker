import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScrumteamsModule } from './scrumteams/scrumteams.module';
import { RefinementsModule } from './refinements/refinements.module';
import { PokersModule } from './pokers/pokers.module';
import { VotesModule } from './votes/votes.module';
import { PointsService } from './points/points.service';

@Module({
  imports: [ScrumteamsModule, RefinementsModule, PokersModule, VotesModule],
  controllers: [AppController],
  providers: [AppService, PointsService],
})
export class AppModule {}
