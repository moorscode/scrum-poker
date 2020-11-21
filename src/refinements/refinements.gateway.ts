import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { RefinementsService } from './refinements.service';
import { CreateRefinementDto } from './dto/create-refinement.dto';
import { UpdateRefinementDto } from './dto/update-refinement.dto';

@WebSocketGateway()
export class RefinementsGateway {
  constructor(private readonly refinementsService: RefinementsService) {}

  @SubscribeMessage('createRefinement')
  create(@MessageBody() createRefinementDto: CreateRefinementDto) {
    return this.refinementsService.create(createRefinementDto);
  }

  @SubscribeMessage('findAllRefinements')
  findAll() {
    return this.refinementsService.findAll();
  }

  @SubscribeMessage('findOneRefinement')
  findOne(@MessageBody() id: number) {
    return this.refinementsService.findOne(id);
  }

  @SubscribeMessage('updateRefinement')
  update(@MessageBody() updateRefinementDto: UpdateRefinementDto) {
    return this.refinementsService.update(updateRefinementDto.id, updateRefinementDto);
  }

  @SubscribeMessage('removeRefinement')
  remove(@MessageBody() id: number) {
    return this.refinementsService.remove(id);
  }
}
