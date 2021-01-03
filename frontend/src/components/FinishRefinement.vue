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
	name: "FinishRefinement",
	computed: {
		...mapState( [ "activePoker" ] ),
	},
	methods: {
		done() {
			this.$socket.client.emit( "finish", { poker: this.activePoker } );
		},
	},
	sockets: {
		finished() {
			this.$store.commit( "refinementFinished", true );
		},
	},
};
</script>
