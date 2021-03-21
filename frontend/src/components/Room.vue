<template>
  <section v-if="!room" >
    <p>Welcome to Pum Scroker!</p>

    <p>
      This tool was created for scrum-teams to have a digital place where they can do their refinement.
      As many teams are working remotely due to the global COVID-19 situation.
    </p>
    <p>Join a room to start refining.</p>

    <form class="rooms">
      Room: <input
        v-model="joinRoom"
        type="text"
      >
      <input
        type="submit"
        value="Join room!"
        @click.prevent="join"
      >
    </form>

    <p>
      <em>Suggestion: Prefix the room with your company name to ensure you are not
        competing for a room.</em>
    </p>
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
		...mapState( [ "room", "nickname" ] ),
	},
	methods: {
		join() {
			this.joinRoom = this.joinRoom.toLowerCase();

			if ( this.joinRoom === "" ) {
				this.$store.commit( "room", "" );
				return;
			}

			this.$socket.client.emit( "join", { poker: this.joinRoom, name: this.nickname } );
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
				this.$socket.client.emit( "leave", { poker: this.room } );
			}
			this.join();
		};
	},
	sockets: {
		welcome() {
			this.join();
		},
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
