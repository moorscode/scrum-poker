import { Test, TestingModule } from '@nestjs/testing';
import { VotesGateway } from './votes.gateway';
import { VotesService } from './votes.service';

describe('VotesGateway', () => {
  let gateway: VotesGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VotesGateway, VotesService],
    }).compile();

    gateway = module.get<VotesGateway>(VotesGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
