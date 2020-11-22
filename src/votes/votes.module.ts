import { Module } from '@nestjs/common';
import { VotesService } from './votes.service';
import { VotesGateway } from './votes.gateway';

@Module({
  providers: [VotesGateway, VotesService],
})
export class VotesModule {}
