<template>
  <section v-if="room">
    <form
      class="username"
    >
      Name:
      <input
        v-model="nickname"
        type="text"
		:disabled="game.started"
      >
      <input
        type="submit"
        value="Update"
        @click.prevent="updateNickname"
		:disabled="game.started"
      >
    </form>
  </section>
</template>

<script>
import { mapState } from "vuex";

export default {
	name: "username",
	data() {
		return {
			nickname: window.localStorage.getItem( "nickname" ),
		};
	},
	computed: {
		...mapState( [ "room", "game" ] ),
	},
	methods: {
		updateNickname() {
			if ( ! this.nickname ) {
				return;
			}

			// Update local storage.
			window.localStorage.setItem( "nickname", this.nickname );

			// Set name in the store.
			this.$store.commit( "nickname", this.nickname );

			// Tell the server.
			this.$socket.client.emit( "nickname", { name: this.nickname, room: this.room } );
		},
	},
};
</script>
