<template>
  <div class="choices">
    <button
      v-for="point of points"
	  v-bind:key="point"
      :class="[
        'choice',
        pointIsPickedClass(point),
        myVote === point ? 'highlighted' : '',
        myInitialVote === point ? 'initial' : '',
      ]"
      @click="castVote(point)"
    >
      <i
        v-if="point === 'coffee'"
        :class="['fas','fa-mug-hot']"
      />
      {{ point }}
    </button>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
	name: "PokerChoices",
	data() {
		return {
			myInitialVote: "",
		};
	},
	computed: {
		...mapState( [ "points", "votes", "observer", "members", "voteCount", "room", "myVote" ] ),
		allVoted() {
			return this.members.voters.length && this.voteCount === this.members.voters.length;
		},
	},
	methods: {
		castVote( vote ) {
			if ( this.observer ) {
				return;
			}

			this.$socket.client.emit( "vote", { poker: this.room, vote } );
		},
		setVote( vote ) {
			if ( this.allVoted && ! this.myInitialVote && this.myVote !== "coffee" ) {
				this.myInitialVote = this.myVote;
			}

			this.$store.commit( "myVote", vote );
		},
		pointIsPickedClass( point ) {
			return this.votes.map( vote => vote.currentValue ).includes( point ) ? "picked" : "";
		},
	},
	sockets: {
		votes( msg ) {
			if ( msg.voteCount === 0 ) {
				this.$store.commit( "myVote", "" );
				this.myInitialVote = "";
			}
		},
		myVote( msg ) {
			this.setVote( msg.currentVote );
			this.myInitialVote = msg.initialVote;
		},
	},
};
</script>
