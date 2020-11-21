import { Test, TestingModule } from '@nestjs/testing';
import { PokersService } from './pokers.service';

describe('PokersService', () => {
  let service: PokersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PokersService],
    }).compile();

    service = module.get<PokersService>(PokersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
