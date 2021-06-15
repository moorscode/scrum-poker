<template>
	<main>
		<server-connection/>

		<section class="game container">
			<h1>Compliments game</h1>

			<section v-if="connected === false">
				<connecting/>
			</section>

			<section v-if="connected">
				<p>Welcome to the compliments game!</p>

				<nickname/>
				<div v-if="nickname">
					<room/>
				</div>

				<div v-if="!room">
					<p v-if="! nickname">Please, set your name first.</p>
					<p v-if="nickname">Enter your team name to start complimenting your team members.</p>
				</div>

				<div v-if="room && nickname" class="gameMain">
					<game-control/>
					<members/>
				</div>
			</section>
		</section>

		<section class="container">
			<translate />
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
import Translate from "./components/Translate.vue";

export default Vue.extend( {
	components: {
		ServerConnection,
		Connecting,
		Nickname,
		Room,
		GameControl,
		Members,
		CardPicker,
		Translate,
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
				"nickname",
			],
		),
	},
} );
</script>
