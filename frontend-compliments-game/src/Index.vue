<template>
	<main>
		<server-connection/>

		<section class="game container">
			<h1>Compliments game</h1>

			<section v-if="connected">
				<room/>
				<div v-if="room" class="gameMain">
					<nickname/>
					<game-control/>
					<members/>
				</div>
			</section>
		</section>
		<card-picker/>
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
import CardPicker from "./components/CardPicker.vue";

export default Vue.extend( {
	components: {
		ServerConnection,
		Connecting,
		Nickname,
		Room,
		GameControl,
		Members,
		CardPicker,
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
