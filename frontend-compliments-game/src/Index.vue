<template>
	<main>
		<server-connection/>

		<section v-if="loading === false" class="game container">
			<h1>Compliments game</h1>

			<section v-if="connected === false">
				<connecting/>
			</section>

			<section>
				<room/>
				<div v-if="room && connected === true" class="gameMain">
					<nickname/>
					<game-control/>
					<members/>
				</div>
			</section>
		</section>
	</main>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState } from "vuex";
import ServerConnection from "./components/ServerConnection.vue";
import Connecting from "./components/Connecting.vue";
import Room from "./components/Room.vue";
import Nickname from "./components/Nickname.vue";
import GameControl from "./components/GameControl.vue";
import Members from "./components/Members.vue";

export default Vue.extend( {
	components: {
		ServerConnection,
		Connecting,
		Nickname,
		Room,
		GameControl,
		Members,
	},
	created() {
		this.$socket.client.open();
	},
	computed: {
		...mapState(
			[
				"loading",
				"connected",
				"room",
			],
		),
	},
} );
</script>
