import { Test, TestingModule } from '@nestjs/testing';
import { RefinementsGateway } from './refinements.gateway';
import { RefinementsService } from './refinements.service';

describe('RefinementsGateway', () => {
  let gateway: RefinementsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RefinementsGateway, RefinementsService],
    }).compile();

    gateway = module.get<RefinementsGateway>(RefinementsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
