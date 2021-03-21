<template>
  <span>
    <button
      class="newStory"
      :disabled="voteCount === 0 || observer"
      @click="newStory()"
    ><i class="fas fa-plus-square" />
      New story
    </button>
    <span
      v-if="allVoted"
      class="allVoted"
    >All votes are in!</span>
  </span>
</template>

<script>
import { mapState } from "vuex";
export default {
	computed: {
		...mapState( [ "voteCount", "observer", "members", "room" ] ),
		allVoted() {
			return this.members.voters.length && this.voteCount === this.members.voters.length;
		},
	},
	methods: {
		newStory() {
			if ( this.voteCount === 0 || this.observer ) {
				return;
			}

			// Confirm when not everybody has voted.
			if ( ! this.allVoted ) {
				if ( ! window.confirm( "Are you sure you want to start a new story, not all votes are in yet." ) ) {
					return;
				}
			}

			this.$socket.client.emit( "newStory", { poker: this.room } );
		},
	},
};
</script>
