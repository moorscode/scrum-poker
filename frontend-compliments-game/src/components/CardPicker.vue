<template>
	<div id="card-picker" v-if="game.started && turn">
		<div class="container">
			<div v-if="turn === userId">
				<h1>It's your turn!</h1>
				<h2>Pick a card</h2>
				<small>Click on a card below to select it:</small>
				<ul>
					<li
						v-for="card in myCards"
						@click="pickCard(card)"
						:class="pickedCard === card ? 'selected' : 'pick'"
					>
						<button v-bind:key="card.id">{{ card.description }}</button>
					</li>
				</ul>
				<h2>Pick a recipient</h2>
				<small>Click on a name below to select it:</small>
				<ul>
					<li
						v-for="member in myRecipients"
						v-bind:key="member.id"
						:class="pickedMember === member ? 'selected' : 'pick'"
					>
						<button @click="pickRecipient(member)">{{ member.name }}</button>
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
				<button @click="voteSkip">Let somebody else go first</button>
			</div>

			<div v-if="turn !== userId">
				<h2>{{ memberIdToName[turn] }} is choosing a card and recipient</h2>
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

		<div class="container" v-if="turn !== userId">
			<div v-if="myRecipients.length > 0">
				<h3>Recipients you can give a card to</h3>
				<p>Note: You can pick one card for each participant.</p>
				<ul>
					<li
							v-for="member in myRecipients"
							v-bind:key="member.id"
					>
						{{ member.name }}
					</li>
				</ul>

				<h3>Cards you can pick from</h3>
				<ul>
					<li
							v-for="card in myCards"
							v-bind:key="card.id"
					>
						{{ card.description }}
					</li>
				</ul>
			</div>
			<div v-if="myRecipients.length === 0">
				<h3>You're done giving compliments</h3>
			</div>
		</div>

		<div class="container" v-if="turn === userId">
			<h3>Game status</h3>
			Members received number of compliments:
			<ul>
				<li
						v-for="member in game.members"
						v-bind:key="'cards-received' + member.id"
				>
					{{ member.name }} - {{ memberReceivedCards( member.id ) }} compliments
				</li>
			</ul>
		</div>

		<div class="container danger">
			<h3>End the game</h3>
			If the time is about to run out or something is going wrong,<br/>
			you can <button @click="confirmStop">end the game</button>.
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
		turn( newValue ) {
			this.pickedMember = { id: "" };
			this.pickedCard = { description: "" };
			this.waited = 0;
			this.waitingTime = 20;

			window.clearInterval( this.counter );
			this.counter = window.setInterval( () => {
				this.waited++;
			}, 1000 );

			document.documentElement.style.overflow = ( newValue === "" || this.game.started === false ) ? "auto" : "hidden";
		},
		game( newValue ) {
			if ( newValue.started === false ) {
				document.documentElement.style.overflow = "auto";
			}
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
		memberReceivedCards( memberId ) {
			return this.game.cards.filter( ( card ) => card.to === memberId ).length;
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
		confirmStop() {
			if ( ! window.confirm(
				"Are you sure you want to end the game?" +
				"\n\nContinueing the game is not possible, you'll need to restart to play again."
			) ) {
				return;
			}

			this.$socket.client.emit(
				"force-finish",
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
