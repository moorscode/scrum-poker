<template>
	<section class="poker container" v-if="debug || ! $socket.connected">
		<span v-if="! $socket.connected">
			<h1>Connecting to server</h1>
			<p>Please be patient...</p>
		</span>

		<div v-if="debug">
			<button v-on:click="connect" :disabled="$socket.connected">Connect</button>
			<button v-on:click="disconnect" :disabled="! $socket.connected">Disconnect</button>
			<br/>
			&nbsp;
		</div>
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
			debug: false,
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
