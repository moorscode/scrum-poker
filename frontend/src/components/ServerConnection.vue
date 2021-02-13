<template></template>

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
			this.$socket.client.emit( "exit" );
		};
	},
	computed: {
		...mapState( [ "members" ] ),
	},
	sockets: {
		disconnect() {
			this.$store.commit( "serverConnection", false );
		},
		connect() {
			this.$store.commit( "serverConnection", true );
		},
		userId( clientId ) {
			if ( ! this.$data.clientId ) {
				this.$data.clientId = clientId;
				window.localStorage.setItem( "clientId", this.$data.clientId );
			}
			this.$socket.client.emit( "identify", { id: this.$data.clientId } );
		},
		welcome() {
			this.$store.commit( "loadingFinished" );
		},
		memberList( msg ) {
			this.$store.commit( "members", msg );
		},
		points( msg ) {
			this.$store.commit( "points", msg );
		},
		story( msg ) {
			this.$store.commit( "votesRevealed", msg.votesRevealed );
		},
		votes( msg ) {
			const votes = msg.votes.sort( ( a, b ) => a.currentValue - b.currentValue ) || [];

			this.$store.commit( "votes", votes );
			this.$store.commit( "voteCount", msg.voteCount );
			this.$store.commit( "votedNames", msg.votedNames );
			this.$store.commit( "groupedVoterNames", msg.groupedVoterNames );
			this.$store.commit( "nearestPointAverage", msg.nearestPointAverage );
			this.$store.commit( "voteAverage", msg.voteAverage );
			this.$store.commit( "votesRevealed", msg.votesRevealed );

			document.title = this.$data.baseTitle + " " + msg.voteCount + "/" + this.members.voters.length;
		},
	},
};
</script>
