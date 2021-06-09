<template>
	<section>
		<div class="start-the-game">
			<div class="game-status">Game: {{ gameStatus }}</div>
			<p>When you are ready to start, press the button below.<br/>
				The game will automatically start when everybody has indicated they are ready.</p>

			<div :class="[ 'ready', members[userId].name === '~please save your name~' ? 'disabled' : '' ]">
				<label>
					<input type="checkbox"
						@click="ready"
						v-model="isReady"
						:disabled="allReady || connectedMembers <= 1 || members[userId].name === '~please save your name~'"
						:class="[ isReady ? 'selected' : '', 'primary']">
					I am ready!
				</label>
				<strong v-if="members[userId].name === '~please save your name~'">&mdash; Please enter your name first</strong>
			</div>
		</div>
	</section>
</template>

<script>
import { mapState } from "vuex";

export default {
	name: "GameControl",
	computed: {
		...mapState( [ "game", "connectedMembers", "room", "userId", "members" ] ),
		gameStatus() {
			/* eslint-disable no-nested-ternary */
			if ( this.game.started ) {
				return "In progress";
			}

			if ( this.connectedMembers < 2 ) {
				return "Waiting for more members to join...";
			}

			const ready = Object.values( this.game.members ).filter( ( member ) => member.ready ).length;

			return this.allReady
				? "Everybody is ready, let's start the game!"
				: `Waiting for everybody to ready up (${ready}/${this.connectedMembers})...`;
		},
		isReady() {
			if ( this.connectedMembers <= 1 ) {
				return false;
			}

			if ( Object.values( this.game.members ).find( ( member ) => member.id === this.userId && member.ready ) ) {
				return true;
			}

			return false;
		},
		allReady() {
			return this.game.started || Object.values( this.game.members ).filter( ( member ) => ! member.ready ).length === 0;
		},
	},
	methods: {
		start() {
			this.$socket.client.emit( "start", { room: this.room } );
		},
		ready() {
			this.$socket.client.emit( "ready", { room: this.room } );
		},
	},
};
</script>
