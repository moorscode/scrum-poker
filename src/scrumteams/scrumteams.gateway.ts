import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { ScrumteamsService } from './scrumteams.service';
import { CreateScrumteamDto } from './dto/create-scrumteam.dto';
import { UpdateScrumteamDto } from './dto/update-scrumteam.dto';

@WebSocketGateway()
export class ScrumteamsGateway {
  constructor(private readonly scrumteamsService: ScrumteamsService) {}

  @SubscribeMessage('createScrumteam')
  create(@MessageBody() createScrumteamDto: CreateScrumteamDto) {
    return this.scrumteamsService.create(createScrumteamDto);
  }

  @SubscribeMessage('findAllScrumteams')
  findAll() {
    return this.scrumteamsService.findAll();
  }

  @SubscribeMessage('findOneScrumteam')
  findOne(@MessageBody() id: number) {
    return this.scrumteamsService.findOne(id);
  }

  @SubscribeMessage('updateScrumteam')
  update(@MessageBody() updateScrumteamDto: UpdateScrumteamDto) {
    return this.scrumteamsService.update(updateScrumteamDto.id, updateScrumteamDto);
  }

  @SubscribeMessage('removeScrumteam')
  remove(@MessageBody() id: number) {
    return this.scrumteamsService.remove(id);
  }
}
