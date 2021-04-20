<template>
	<section class="poker container" v-if="! $socket.connected">
		<h1>Connecting to server</h1>
		<p>Please be patient...</p>
	</section>
</template>

<script>
import { mapState } from "vuex";

export default {
	name: "ServerConnection",
	data() {
		return {
			clientId: window.localStorage.getItem( "clientId" ) || false,
			nickname: window.localStorage.getItem( "nickname" ),
			baseTitle: document.title,
		};
	},
	created() {
		// Set name in the store.
		this.$store.commit( "nickname", this.nickname );

		window.onbeforeunload = () => {
			this.$socket.client.emit( "exit", this.room );
		};
	},
	methods: {
		connect() {
			this.$socket.client.connect();
		},
		disconnect() {
			this.$socket.client.disconnect();
		},
	},
	computed: {
		...mapState( [ "members", "room" ] ),
	},
	sockets: {
		userId( clientId ) {
			if ( ! this.$data.clientId ) {
				this.$data.clientId = clientId;
				window.localStorage.setItem( "clientId", this.$data.clientId );
			}
			this.$socket.client.emit( "identify", { id: this.$data.clientId } );
		},
		votes( msg ) {
			document.title = this.$data.baseTitle + " " + msg.voteCount + "/" + this.members.voters.length;
		},
	},
};
</script>
