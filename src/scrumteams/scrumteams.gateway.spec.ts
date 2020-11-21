import { Test, TestingModule } from '@nestjs/testing';
import { ScrumteamsGateway } from './scrumteams.gateway';
import { ScrumteamsService } from './scrumteams.service';

describe('ScrumteamsGateway', () => {
  let gateway: ScrumteamsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScrumteamsGateway, ScrumteamsService],
    }).compile();

    gateway = module.get<ScrumteamsGateway>(ScrumteamsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
