import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { PokersService } from './pokers.service';
import { CreatePokerDto } from './dto/create-poker.dto';
import { UpdatePokerDto } from './dto/update-poker.dto';

@WebSocketGateway()
export class PokersGateway {
  constructor(private readonly pokersService: PokersService) {}

  @SubscribeMessage('createPoker')
  create(@MessageBody() createPokerDto: CreatePokerDto) {
    return this.pokersService.create(createPokerDto);
  }

  @SubscribeMessage('findAllPokers')
  findAll() {
    return this.pokersService.findAll();
  }

  @SubscribeMessage('findOnePoker')
  findOne(@MessageBody() id: number) {
    return this.pokersService.findOne(id);
  }

  @SubscribeMessage('updatePoker')
  update(@MessageBody() updatePokerDto: UpdatePokerDto) {
    return this.pokersService.update(updatePokerDto.id, updatePokerDto);
  }

  @SubscribeMessage('removePoker')
  remove(@MessageBody() id: number) {
    return this.pokersService.remove(id);
  }
}
