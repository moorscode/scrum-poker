<template>
  <button
    class="refinement-done"
    @click="done()"
  >
    <i class="fas fa-clipboard-check" /> Finish refinement
  </button>
</template>

<script>
import { mapState } from "vuex";
export default {
	name: "Refinement",
	computed: {
		...mapState( [ "voteCount", "members", "activePoker" ] ),
	},
	methods: {
		done() {
			if ( this.voteCount > 0 && this.voteCount !== this.members.voters.length ) {
				if ( ! window.confirm( "Are you sure you want to finish the refinement, not all votes are in yet." ) ) {
					return;
				}
			}

			this.$socket.client.emit( "finish", { poker: this.activePoker } );
		},
	},
};
</script>
