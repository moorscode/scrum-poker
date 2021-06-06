<template>
	<section>
		Game: {{ gameStatus }}<br/>
		<button @click="start" :disabled="game.started || connectedMembers <= 1">Start game</button>
	</section>
</template>

<script>
import { mapState } from "vuex";

export default {
	name: "GameControl",
	computed: {
		...mapState( [ "game", "connectedMembers", "room" ] ),
		gameStatus() {
			/* eslint-disable no-nested-ternary */
			return this.game.started
				? "In progress"
				: this.connectedMembers <= 1
					? "Awaiting more players"
					: "Ready to start";
		},
	},
	methods: {
		start() {
			this.$socket.client.emit( "start", { room: this.room } );
		},
	},
};
</script>
