<template>
  <form class="votingSystem">
    <label>Cards:
      <select v-model="selectedVotingSystem" >
        <option value="Points">Points</option>
        <option value="Emoji">Emoji</option>
      </select>
    </label>
    <input
      type="submit"
      value="Update"
      @click.prevent="setVotingSystem()"
    >
  </form>
</template>

<script>
import { mapState } from "vuex";
export default {
	name: "VotingSystem",
	data() {
		return {
			selectedVotingSystem: "Points",
		};
	},
	computed: {
		...mapState( [ "votingSystem", "room", "voteCount" ] ),
	},
	methods: {
		setVotingSystem() {
			if (
				this.selectedVotingSystem !== this.votingSystem &&
				( this.voteCount < 1 || window.confirm( "Are you sure? This will reset all votes for the current story" ) )
			) {
				this.$socket.client.emit( "setVotingSystem", { poker: this.room, votingSystem: this.selectedVotingSystem } );
			}
		},
	},
	sockets: {
		story( msg ) {
			this.selectedVotingSystem = msg.votingSystem;
		},
	},
};
</script>
