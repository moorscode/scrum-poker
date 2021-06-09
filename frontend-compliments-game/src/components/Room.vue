<template>
	<section>
		<form class="rooms">
			Team: <input
				v-model="joinRoom"
				type="text"
				:disabled="game.started"
		>
			<input
					type="submit"
					v-model="joinButton"
					:disabled="game.started"
					@click.prevent="join"
			>
		</form>
	</section>
</template>

<script>
import { mapState } from "vuex";

export default {
	name: "PickRoom",
	data() {
		return {
			joinRoom: this.getFromURL( "room" ) || "",
		};
	},
	computed: {
		...mapState( [ "room", "nickname", "game", "loading" ] ),
		joinButton() {
			return this.room ? "Switch to team" : "Join team!";
		},
	},
	methods: {
		join() {
			if ( this.loading ) {
				return;
			}

			this.joinRoom = this.joinRoom.toLowerCase();

			if ( this.joinRoom !== this.room ) {
				this.$socket.client.emit( "leave", { room: this.room } );
			}

			if ( this.joinRoom === "" ) {
				this.$store.commit( "room", "" );
				return;
			}

			this.$socket.client.emit( "join", { room: this.joinRoom, name: this.nickname } );
		},
		getFromURL( key ) {
			return new URLSearchParams( window.location.search.substring( 1 ) ).get( key );
		},
	},
	created() {
		this.join();
		window.onpopstate = ( event ) => {
			this.joinRoom = ( event.state && event.state.room ) || "";
			if ( this.joinRoom !== this.room ) {
				this.$socket.client.emit( "leave", { room: this.room } );
			}
			this.join();
		};
	},
	watch: {
		loading( newValue ) {
			if ( newValue === false ) {
				this.join();
			}
		},
	},
	sockets: {
		joined( room ) {
			this.joinRoom = room;

			if ( room !== false && this.room !== room ) {
				const url = new URL( window.location );
				url.searchParams.set( "room", room );
				window.history.pushState( { room }, "", url );
			}
		},
	},
};
</script>
