<template>
	<div id="card-picker" v-if="game.started && turn">
		<div class="container">
			<div v-if="turn === userId">
				<h1>It's your turn!</h1>
				<h2>Pick a card</h2>
				<small>Click on an item below to select it.</small>
				<ul>
					<li
						v-for="card in myCards"
						@click="pickCard(card)"
						v-bind:key="card.id"
						:class="pickedCard === card ? 'selected' : 'pick'"
					>
						{{ card.description }}
					</li>
				</ul>
				<h2>Pick a recipient</h2>
				<small>Click on a name below to select it.</small>
				<ul>
					<li
						v-for="member in myRecipients"
						@click="pickRecipient(member)"
						v-bind:key="member.id"
						:class="pickedMember === member ? 'selected' : 'pick'"
					>
						{{ member.name }}
					</li>
				</ul>

				<p>
					Take a moment to explain why this fits the person you picked so well.
				</p>

				<button
						@click="giveCard"
						:disabled="!pickedCard.id || !pickedMember.id"
						class="primary"
				>Give the card
				</button>
				 &ndash; Recipient indisposed?
					<button @click="voteSkip">Let somebody else go instead</button>
			</div>
			<div v-if="turn !== userId">
				<h2>{{ memberIdToName[turn] }} is choosing the card and recipient</h2>
				<p>
					<strong>Card:</strong>
					{{ pickedCard.description || "..." }}
				</p>

				<p>
					<strong>Recipient:</strong>
					{{ pickedMember.id === userId ? "YOU!" : memberIdToName[pickedMember.id] || "..." }}
				</p>

				<p>
					Taking too long? Vote to skip...
					<button
							@click="voteSkip"
							:disabled="waited < waitingTime"
					>Next please
						<span v-if="waited < waitingTime">(available in {{ waitingTime - waited }} seconds)</span>
					</button>
				</p>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState } from "vuex";

export default {
	name: "card-picker",
	data() {
		return {
			pickedCard: { id: "" },
			pickedMember: { id: "" },
			debug: false,
			waited: 0,
			waitingTime: 20,
			counter: null,
		};
	},
	computed: {
		...mapState( [ "room", "game", "userId", "turn", "memberIdToName" ] ),
		myCards() {
			return this.game.cards.filter( ( card ) => card.from === this.userId && ! card.to );
		},
		myRecipients() {
			return this.game.members.filter( ( member ) => {
				if ( member.id === this.userId ) {
					return false;
				}

				const givenCards = this.game.cards.filter( ( card ) => card.from === this.userId && card.to );
				const givenMemberIds = givenCards.map( ( card ) => card.to );
				return ! givenMemberIds.includes( member.id );
			} );
		},
	},
	watch: {
		turn() {
			this.pickedMember = { id: "" };
			this.pickedCard = { description: "" };
			this.waited = 0;

			window.clearInterval( this.counter );
			this.counter = window.setInterval( () => {
				this.waited++;
			}, 1000 );
		},
	},
	methods: {
		pickCard( card ) {
			this.pickedCard = card;

			this.$socket.client.emit(
				"pick",
				{
					room: this.room,
					card: this.pickedCard.id,
					to: this.pickedMember.id,
				},
			);
		},
		pickRecipient( member ) {
			this.pickedMember = member;

			this.$socket.client.emit(
				"pick",
				{
					room: this.room,
					card: this.pickedCard.id,
					to: this.pickedMember.id,
				},
			);
		},
		giveCard() {
			this.$socket.client.emit(
				"give",
				{
					room: this.room,
					card: this.pickedCard.id,
					to: this.pickedMember.id,
				},
			);
		},
		voteSkip() {
			this.$socket.client.emit(
				"vote-skip",
				{
					room: this.room,
				},
			);
		},
	},
	sockets: {
		picked( data ) {
			this.waited = 0;
			if ( data.from !== this.userId ) {
				this.pickedMember.id = data.to;
				this.pickedCard = data.card;

				this.waitingTime = ( data.to && data.card.id ) ? 90 : 20;
			}
		},
	},
};
</script>
