<template>
  <section v-if="room">
    <form
      class="username"
      :class="[!nickname ? 'hover' : '']"
    >
      <span><i class="fas fa-signature" /> Nickname:</span>
      <input
        v-model="nickname"
        type="text"
      >
      <input
        type="submit"
        value="Update"
        @click.prevent="updateNickname"
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
		...mapState( [ "room" ] ),
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
			this.$socket.client.emit( "nickname", { name: this.nickname, poker: this.room } );
		},
	},
};
</script>
