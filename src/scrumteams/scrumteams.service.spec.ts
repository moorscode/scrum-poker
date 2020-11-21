import { Test, TestingModule } from '@nestjs/testing';
import { ScrumteamsService } from './scrumteams.service';

describe('ScrumteamsService', () => {
  let service: ScrumteamsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScrumteamsService],
    }).compile();

    service = module.get<ScrumteamsService>(ScrumteamsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
