import { Test, TestingModule } from '@nestjs/testing';
import { PokersGateway } from './pokers.gateway';
import { PokersService } from './pokers.service';

describe('PokersGateway', () => {
  let gateway: PokersGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PokersGateway, PokersService],
    }).compile();

    gateway = module.get<PokersGateway>(PokersGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
