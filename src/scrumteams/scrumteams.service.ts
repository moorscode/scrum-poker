import { Injectable } from '@nestjs/common';
import { CreateScrumteamDto } from './dto/create-scrumteam.dto';
import { UpdateScrumteamDto } from './dto/update-scrumteam.dto';

@Injectable()
export class ScrumteamsService {
  create(createScrumteamDto: CreateScrumteamDto) {
    return 'This action adds a new scrumteam';
  }

  findAll() {
    return `This action returns all scrumteams`;
  }

  findOne(id: number) {
    return `This action returns a #${id} scrumteam`;
  }

  update(id: number, updateScrumteamDto: UpdateScrumteamDto) {
    return `This action updates a #${id} scrumteam`;
  }

  remove(id: number) {
    return `This action removes a #${id} scrumteam`;
  }
}
