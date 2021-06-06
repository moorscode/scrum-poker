<template>
	<div id="card-picker" v-if="game.started && turn">
		<div class="container">
			<div v-if="turn === userId">
				<h2>Pick a card</h2>
				<ul>
					<li
						v-for="card in myCards"
						@click="pickCard(card)"
						v-bind:key="card.description"
						:class="pickedCard === card ? 'selected' : 'pick'"
					>
						{{ card.description }}
					</li>
				</ul>
				<h2>Pick a recipient</h2>
				<ul>
					<li
						v-for="member in myRecipients"
						@click="pickRecipient(member)"
						v-bind:key="member.id"
						:class="pickedMember === member ? 'selected' : 'pick'">
						{{ member.name }}
					</li>
				</ul>
				<button @click="giveCard" :disabled="!pickedCard || !pickedMember">Give the card</button>
			</div>
			<div v-if="turn !== userId">
				<h2>{{ memberIdToName[turn] }} is choosing the card and recipient</h2>
				<p><strong>Card:</strong> {{ pickedCard.description }}</p>
				<p><strong>Recipient:</strong> {{ pickedMember.id === userId ? "YOU!" : memberIdToName[ pickedMember.id ] }}</p>

				<p v-if="debug">
				Taking too long, away from computer, connection issues? Vote to skip...
				<button @click="voteSkip">Next please</button>
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
			pickedCard: { description: "" },
			pickedMember: { id: "" },
			debug: false,
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
		},
	},
	methods: {
		pickCard( card ) {
			this.pickedCard = card;

			this.$socket.client.emit(
				"pick",
				{
					room: this.room,
					card: this.pickedCard.description,
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
					card: this.pickedCard.description,
					to: this.pickedMember.id,
				},
			);
		},
		giveCard() {
			this.$socket.client.emit(
				"give",
				{
					room: this.room,
					to: this.pickedMember.id,
					card: this.pickedCard.description,
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
			if ( data.from !== this.userId ) {
				this.pickedMember.id = data.to;
				this.pickedCard.description = data.card;
			}
		},
	},
};
</script>
