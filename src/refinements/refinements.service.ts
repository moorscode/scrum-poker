import { Injectable } from '@nestjs/common';
import { CreateRefinementDto } from './dto/create-refinement.dto';
import { UpdateRefinementDto } from './dto/update-refinement.dto';

@Injectable()
export class RefinementsService {
  create(createRefinementDto: CreateRefinementDto) {
    return 'This action adds a new refinement';
  }

  findAll() {
    return `This action returns all refinements`;
  }

  findOne(id: number) {
    return `This action returns a #${id} refinement`;
  }

  update(id: number, updateRefinementDto: UpdateRefinementDto) {
    return `This action updates a #${id} refinement`;
  }

  remove(id: number) {
    return `This action removes a #${id} refinement`;
  }
}
