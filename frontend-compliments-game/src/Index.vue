<template>
	<main>
		<server-connection/>

		<section v-if="loading === false" class="game container">
			<h1>Compliments game</h1>

			<section v-if="connected === false">
				<connecting/>
			</section>

			<section v-if="connected === true">
				<room/>

				<div v-if="room" class="gameMain">
					<nickname/>
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

export default Vue.extend( {
	components: {
		ServerConnection,
		Connecting,
		Nickname,
		Room,
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
