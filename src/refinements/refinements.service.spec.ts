import { Test, TestingModule } from '@nestjs/testing';
import { RefinementsService } from './refinements.service';

describe('RefinementsService', () => {
  let service: RefinementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RefinementsService],
    }).compile();

    service = module.get<RefinementsService>(RefinementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
