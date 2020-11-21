import { Module } from '@nestjs/common';
import { ScrumteamsService } from './scrumteams.service';
import { ScrumteamsGateway } from './scrumteams.gateway';

@Module({
  providers: [ScrumteamsGateway, ScrumteamsService]
})
export class ScrumteamsModule {}
