import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { VotesService } from './votes.service';
import { CreateVoteDto } from './dto/create-vote.dto';
import { UpdateVoteDto } from './dto/update-vote.dto';

@WebSocketGateway()
export class VotesGateway {
  constructor(private readonly votesService: VotesService) {}

  @SubscribeMessage('createVote')
  create(@MessageBody() createVoteDto: CreateVoteDto) {
    return this.votesService.create(createVoteDto);
  }

  @SubscribeMessage('findAllVotes')
  findAll() {
    return this.votesService.findAll();
  }

  @SubscribeMessage('findOneVote')
  findOne(@MessageBody() id: number) {
    return this.votesService.findOne(id);
  }

  @SubscribeMessage('updateVote')
  update(@MessageBody() updateVoteDto: UpdateVoteDto) {
    return this.votesService.update(updateVoteDto.id, updateVoteDto);
  }

  @SubscribeMessage('removeVote')
  remove(@MessageBody() id: number) {
    return this.votesService.remove(id);
  }
}
