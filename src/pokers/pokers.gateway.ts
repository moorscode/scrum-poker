import {
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { var_export } from 'locutus/php/var';
import { Server, Socket } from 'socket.io';
import { PointsService } from '../points/points.service';
import { Client, MemberList, Story, Vote, VoteValue } from './poker-room';
import { PokersService } from './pokers.service';

interface StoryResponse {
  name: string;
  voteAverage?: number | string;
  votes: VoteResponse[];
}

interface VoteResponse {
  voterName: string;
  currentValue: VoteValue;
  initialValue: VoteValue;
}

interface MembersResponse {
  voters: ClientResponse[];
  observers: ClientResponse[];
  disconnected: ClientResponse[];
}

interface ClientResponse {
  name: string;
  id: string;
}

@WebSocketGateway({ namespace: '/pokers' })
export class PokersGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;

  constructor(private readonly pokersService: PokersService) {}

  afterInit(): void {
    this.server.on('connection', (socket) => {
      // Let the client know the points that can be chosen from.
      socket.emit('points', { points: PointsService.getPoints() });
      socket.emit('userId', this.generateId());

      // Clean up after disconnection.
      socket.on('disconnecting', () => {
        const sockets = this.pokersService.getClientSockets(socket);

        for (const room in socket.rooms) {
          if (!room.includes('/pokers#')) {
            this.pokersService.disconnect(socket, room);
          }

          sockets.forEach((socketId: string) => {
            this.server.sockets[socketId] &&
              this.server.sockets[socketId].emit('reconnect');
          });

          this.sendMembers(room);
          this.sendAllVotes(room);
        }
      });
    });
  }

  /**
   * Generates a user Id.
   *
   * @returns {string} User Id.
   * @private
   */
  private generateId(): string {
    return (
      Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
    ).toUpperCase();
  }

  @SubscribeMessage('identify')
  identify(client: Socket, message: { id: string }): void {
    this.pokersService.greet(client, message.id);
    client.emit('welcome');
  }

  @SubscribeMessage('exit')
  exit(client: Socket): void {
    const sockets = this.pokersService.getClientSockets(client);

    this.pokersService.exit(client);

    sockets.forEach((socketId: string) => {
      this.server.sockets[socketId] &&
        this.server.sockets[socketId].emit('reconnect');
    });
  }

  @SubscribeMessage('join')
  join(client: Socket, message: { poker: string; name?: string }): void {
    this.pokersService.join(client, message.poker, message.name);
    const voteObject: Vote | null = this.pokersService.getVote(
      client,
      message.poker,
    );

    let vote: VoteResponse | null = null;
    if (voteObject) {
      vote = this.getVoteForResponse(voteObject);
    }
    client.emit('joined', { poker: message.poker, vote });

    this.sendMembers(message.poker);
    this.sendAllVotes(message.poker);
    this.sendHistory(message.poker);
    this.sendCurrentStory(message.poker);
  }

  @SubscribeMessage('leave')
  leave(client: Socket, message: { poker: string }): void {
    const sockets = this.pokersService.getClientSockets(client);

    this.pokersService.leave(client, message.poker);

    sockets.forEach((socketId: string) => {
      this.server.sockets[socketId] &&
        this.server.sockets[socketId].emit('reconnect');
    });

    this.sendMembers(message.poker);
    this.sendAllVotes(message.poker);
    this.sendCurrentStory(message.poker);
  }

  @SubscribeMessage('vote')
  vote(client: Socket, message: { poker: string; vote }): void {
    this.pokersService.vote(client, message.poker, message.vote);

    this.sendAllVotes(message.poker);
    this.sendCurrentStory(message.poker);
  }

  @SubscribeMessage('finish')
  finish(client: Socket, message: { poker: string }): void {
    this.server.to(message.poker).emit('finished');
  }

  @SubscribeMessage('nickname')
  setNickname(client: Socket, message: { name: string; poker: string }): void {
    this.pokersService.setName(message.poker, client, message.name);

    this.sendMembers(message.poker);
    this.sendAllVotes(message.poker);
    this.sendMembers(message.poker);
  }

  @SubscribeMessage('newStory')
  newStory(client: Socket, message: { poker: string }): void {
    this.pokersService.newStory(message.poker);

    this.sendAllVotes(message.poker);
    this.sendHistory(message.poker);
    this.sendCurrentStory(message.poker);
  }

  @SubscribeMessage('changeStoryName')
  story(client: Socket, message: { poker: string; name: string }): void {
    this.pokersService.setStoryName(message.poker, message.name);

    this.sendCurrentStory(message.poker);
  }

  @SubscribeMessage('popHistory')
  popHistory(client: Socket, message: { poker: string }): void {
    this.pokersService.popHistory(message.poker);

    this.sendHistory(message.poker);
  }

  @SubscribeMessage('resetHistory')
  resetHistory(client: Socket, message: { poker: string }): void {
    this.pokersService.resetHistory(message.poker);

    this.sendHistory(message.poker);
  }

  @SubscribeMessage('observe')
  observer(client: Socket, message: { poker: string }): void {
    this.pokersService.observe(client, message.poker);

    this.sendMembers(message.poker);
    this.sendAllVotes(message.poker);
    this.sendCurrentStory(message.poker);
  }

  @SubscribeMessage('debug')
  getDebug(client: Socket, message: { secret: string }): any {
    if (
      process.env.DEBUG_SECRET &&
      message.secret === process.env.DEBUG_SECRET
    ) {
      client.emit('debug', var_export(this.pokersService.debug(), true));
    }
  }

  /**
   * Sends all votes to a room.
   *
   * @param {string} poker Room to send the votes for.
   *
   * @private
   */
  private sendAllVotes(poker: string): void {
    const { voteCount, votes, groupedVoterNames } = this.pokersService.getVotes(
      poker,
    );

    this.server.to(poker).emit('votes', {
      votes: this.getVotesForResponse(votes),
      voteCount: voteCount,
      groupedVoterNames: groupedVoterNames,
      votedNames: this.pokersService.getVotedNames(poker),
    });
  }

  /**
   * Sends an actual members count to a room.
   *
   * @param {string} room The room.
   *
   * @private
   */
  private sendMembers(room: string): void {
    const clients: MemberList = this.pokersService.getClients(room);
    this.server
      .to(room)
      .emit('member-list', this.getMembersForResponse(clients));
  }

  /**
   * Sends the story-history to all clients in a room.
   *
   * @param {string} room The room.
   *
   * @private
   */
  private sendHistory(room: string): void {
    const stories = this.pokersService.getHistory(room);
    this.server.to(room).emit('history', {
      stories: this.getStoriesForResponse(stories),
    });
  }

  /**
   * Sends the story name to all room members.
   *
   * @param {string} room The room.
   *
   * @private
   */
  private sendCurrentStory(room: string): void {
    this.server.to(room).emit('storyUpdated', {
      currentStory: this.getStoryForResponse(
        this.pokersService.getCurrentStory(room),
      ),
    });
  }

  private getVotesForResponse(votes: Vote[]): VoteResponse[] {
    return votes.map(this.getVoteForResponse);
  }

  private getVoteForResponse(vote: Vote): VoteResponse {
    return {
      currentValue: vote.currentValue,
      initialValue: vote.initialValue,
      voterName: vote.voter.name,
    };
  }

  private getStoriesForResponse(stories: Story[]): StoryResponse[] {
    return stories.map(this.getStoryForResponse.bind(this));
  }

  private getStoryForResponse(story: Story): StoryResponse {
    return {
      name: story.name,
      voteAverage: story.voteAverage,
      votes: this.getVotesForResponse(story.votes),
    };
  }

  private getMembersForResponse(memberList: MemberList): MembersResponse {
    const mapCallback = this.getClientForResponse;
    return {
      voters: Object.values(memberList.voters).map(mapCallback),
      observers: Object.values(memberList.observers).map(mapCallback),
      disconnected: Object.values(memberList.disconnected).map(mapCallback),
    };
  }

  private getClientForResponse(client: Client): ClientResponse {
    return {
      id: client.id,
      name: client.name,
    };
  }
}
