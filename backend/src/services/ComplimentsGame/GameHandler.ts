import CardsProvider, { Card } from "./CardsProvider";
import GameMemberManager, { Member } from "./GameMemberManager";

export type GameMember = Member & {
	ready: boolean;
}

export type Game = {
	cards: Card[];
	members: GameMember[];
	started: boolean;
}

export type GameMemberList = {
	[ memberId: string ]: GameMember
}

/**
 * Poker story handler.
 */
export default class GameHandler {
	private readonly game: Game;
	private lastTurnMemberId = "";

	/**
	 * Creates a new Poker Story.
	 *
	 * @param {GameMemberManager} membersManager The members manager to use.
	 * @param {CardsProvider} cardsProvider The cards provider.
	 */
	public constructor(
		private readonly membersManager: GameMemberManager,
		private readonly cardsProvider: CardsProvider,
	) {
		this.game = { cards: [], members: [], started: false };

		this.membersManager.on( "member-added", this.addMember.bind( this ) );
		this.membersManager.on( "member-removed", this.removeMember.bind( this ) );
	}

	/**
	 * Deals with a member joining.
	 *
	 * @returns {void}
	 *
	 * @private
	 */
	private addMember(): void {
		if ( this.game.started ) {
			return;
		}

		this.refreshMembers();
	}

	/**
	 * Refreshes the member list.
	 *
	 * @returns {void}
	 *
	 * @private
	 */
	private refreshMembers(): void {
		this.game.members = this.membersManager.getConnected()
			.reduce(
				( memberList: GameMember[], member: Member ): GameMember[] => {
					let found: GameMember = memberList.find( ( gameMember: GameMember ) => gameMember.id === member.id );
					if ( ! found ) {
						found = {
							ready: false,
							...member,
						};
					}

					memberList.push( found );

					return memberList;
				},
				[],
			);

		if ( this.game.members.length <= 1 ) {
			this.resetReady();
		}
	}

	/**
	 * Resets all player ready statuses.
	 *
	 * @returns {void}
	 *
	 * @private
	 */
	private resetReady(): void {
		this.game.members = this.game.members.map( ( member: GameMember ) => {
			member.ready = false;
			return member;
		} );
	}

	/**
	 * Retrieves the list of game members.
	 *
	 * @returns {GameMemberList} The list of game members.
	 */
	public getMembers(): GameMemberList {
		return this.game.members.reduce( ( list: GameMemberList, member: GameMember ) => {
			list[ member.id ] = member;
			return list;
		}, {} );
	}

	/**
	 * Retrieves a card by Id.
	 *
	 * @param {string} cardId The card ID.
	 *
	 * @returns {Card} The card.
	 */
	public getCard( cardId: string ): Card {
		if ( ! cardId ) {
			return {
				description: "",
				id: "",
			};
		}

		return this.game.cards.find( ( card: Card ) => card.id === cardId );
	}

	/**
	 * Marks a member as ready to start.
	 *
	 * @param {string} memberId The member.
	 *
	 * @returns {void}
	 */
	public setReady( memberId: string ): void {
		this.game.members.map( ( member: GameMember ) => {
			if ( member.id === memberId ) {
				member.ready = true;
			}
			return member;
		} );
	}

	/**
	 * Removes a member from the game.
	 *
	 * @param {string} memberId The member that left.
	 *
	 * @returns {void}
	 */
	public removeMember( memberId: string ): void {
		this.refreshMembers();

		this.game.cards = this.game.cards.filter( ( card: Card ) => card.from !== memberId && card.to !== memberId );

		const memberCount    = this.game.members.length;
		const cardsPerMember = memberCount - 1;

		if ( memberCount <= 1 ) {
			this.finishGame();
			return;
		}

		this.game.members.forEach( ( member: Member ) => {
			// If we removed an already given card, we don't have anything else to do.
			const memberCards = this.game.cards.filter( ( card: Card ) => card.from === member.id );
			if ( memberCards.length === cardsPerMember ) {
				return;
			}

			// Remove the first unassigned card.
			const index = this.game.cards.findIndex( ( card: Card ) => card.from === member.id && ! card.to );
			this.game.cards.splice( index, 1 );
		} );
	}

	/**
	 * Assigns the cards to the members of the room.
	 *
	 * @returns {boolean} If the cards could be assigned.
	 */
	private assignCards(): boolean {
		const members: GameMember[] = this.game.members;
		const memberCount           = members.length;
		const cards                 = this.cardsProvider.getCards();
		const cardsPerMember        = memberCount - 1;

		// Each member gets a card for all other members.
		const totalNumberOfCards = cardsPerMember * memberCount;

		if ( totalNumberOfCards < 1 ) {
			return false;
		}

		const shuffledCards = this.shuffleArray( cards );

		this.game.cards = shuffledCards.slice( 0, totalNumberOfCards ).filter( () => true );

		let cardIndex = 0;

		members.forEach( ( member: GameMember ) => {
			for ( let counter = 0; counter < cardsPerMember; counter++ ) {
				this.game.cards[ cardIndex ].from = member.id;
				cardIndex++;
			}
		} );

		return true;
	}

	/**
	 * Starts a game.
	 *
	 * @returns {void}
	 */
	public startGame(): void {
		if ( ! this.isEverybodyReady() ) {
			return;
		}

		if ( this.assignCards() ) {
			this.game.started = true;

			this.selectTurnMemberId();
		}
	}

	private isEverybodyReady(): boolean {
		return this.game.members.filter( ( member: GameMember ) => ! member.ready ).length === 0;
	}

	/**
	 * Gives a card to a member.
	 *
	 * @param {string} memberId The giver.
	 * @param {string} cardId The card.
	 * @param {string} to The receiver.
	 *
	 * @returns {Card} The picked card.
	 */
	public giveCard( memberId: string, cardId: string, to: string ): Card {
		const theCard = this.game.cards.find( ( card: Card ) => card.id === cardId );
		theCard.to    = to;

		this.selectTurnMemberId();

		return theCard;
	}

	/**
	 * Selects the next member who's turn it will be.
	 *
	 * @returns {void}
	 *
	 * @private
	 */
	private selectTurnMemberId(): void {
		// Only if there are still cards left...
		if ( ! this.haveAvailableCards() ) {
			this.finishGame();
			return;
		}

		let memberIds = this.game.members.map( ( member: Member ) => member.id );

		memberIds = memberIds.filter(
			( memberId ) => this.game.cards.filter( ( card: Card ) => card.from === memberId && ! card.to ).length !== 0,
		);

		memberIds = [ ...new Set( memberIds ) ];

		if ( memberIds.length > 1 ) {
			memberIds = memberIds.filter( ( memberId ) => memberId !== this.lastTurnMemberId );
		}

		/**
		 * This is not needed with the skip functionality.
		 *
		memberIds = memberIds.filter( ( memberId ) =>
			this.membersManager.getConnected().map( ( member: Member ) => member.id ).includes( memberId ),
		);
		 **/

		if ( memberIds.length === 0 ) {
			this.finishGame();
			return;
		}

		const index = memberIds.length === 1 ? 0 : Math.floor( Math.random() * memberIds.length );

		this.lastTurnMemberId = memberIds[ index ];
	}

	/**
	 * Retreives who's turn it is.
	 *
	 * @returns {string} The member ID who's turn it is.
	 */
	public getTurnMemberId(): string {
		return this.lastTurnMemberId;
	}

	/**
	 * Checks if there are any ungiven cards left in the game.
	 *
	 * @returns {boolean} True if there are cards to give.
	 */
	public haveAvailableCards(): boolean {
		return this.game.cards.filter( ( card: Card ) => ! card.to ).length > 0;
	}

	/**
	 * Finishes a game.
	 *
	 * @returns {void}
	 */
	public finishGame(): void {
		this.game.started = false;

		this.refreshMembers();
		this.resetReady();
	}

	/**
	 * Retrieves the game.
	 *
	 * @returns {Game} The game.
	 */
	public getGame(): Game {
		return this.game;
	}

	/**
	 * Skips the current turn to another player.
	 *
	 * @returns {void}
	 */
	public voteSkip(): void {
		this.selectTurnMemberId();
	}

	/**
	 * Shuffles an Card array.
	 *
	 * @param {Card[]} array List of cards.
	 *
	 * @returns {Card[]} Shuffled list of cards.
	 *
	 * @private
	 */
	private shuffleArray( array: Card[] ) {
		for ( let index = array.length - 1; index > 0; index-- ) {
			const secondIndex    = Math.floor( Math.random() * ( index + 1 ) );
			const temp           = array[ index ];
			array[ index ]       = array[ secondIndex ];
			array[ secondIndex ] = temp;
		}

		return array;
	}
}
