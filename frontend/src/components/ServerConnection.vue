<template></template>

<script>
export default {
	name: "ServerConnection",
	data() {
		return {
			clientId: window.localStorage.getItem( "clientId" ) || false,
			baseTitle: document.title,
		};
	},
	created() {
		window.onbeforeunload = () => {
			this.$socket.client.emit( "exit" );
		};
	},
	sockets: {
		disconnect() {
			this.$store.commit( 'serverConnection', false );
		},
		connect() {
			this.$store.commit( 'serverConnection', true );
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
			this.$store.commit( "points", msg.points );
		},
		votes( msg ) {
			const votes = msg.votes.sort( ( a, b ) => a.currentValue - b.currentValue ) || [];

			this.$store.commit( "votes", votes );
			this.$store.commit( "voteCount", msg.voteCount );
			this.$store.commit( "votedNames", msg.votedNames );
			this.$store.commit( "groupedVoterNames", msg.groupedVoterNames );
			this.$store.commit( "pointSpread", this.$data.pointSpread );

			document.title = this.$data.baseTitle + " " + this.$store.state.voteCount + "/" + this.$store.state.members.voters.length;
		},
	},
}
</script>