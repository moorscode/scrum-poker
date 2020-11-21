import { Injectable } from '@nestjs/common';
import { CreatePokerDto } from './dto/create-poker.dto';
import { UpdatePokerDto } from './dto/update-poker.dto';

@Injectable()
export class PokersService {
  create(createPokerDto: CreatePokerDto) {
    return 'This action adds a new poker';
  }

  findAll() {
    return `This action returns all pokers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} poker`;
  }

  update(id: number, updatePokerDto: UpdatePokerDto) {
    return `This action updates a #${id} poker`;
  }

  remove(id: number) {
    return `This action removes a #${id} poker`;
  }
}
