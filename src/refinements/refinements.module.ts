import { Module } from '@nestjs/common';
import { RefinementsService } from './refinements.service';
import { RefinementsGateway } from './refinements.gateway';

@Module({
  providers: [RefinementsGateway, RefinementsService]
})
export class RefinementsModule {}
