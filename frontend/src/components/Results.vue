<template>
  <span>
    <p :class="[ 'results', members.length === voteCount ? 'final' : '' ]">
      <span
        v-for="vote of votes"
        class="resultContainer"
      >
        <button
          v-if="vote.initialValue !== vote.currentValue"
          class="result initialVote"
        >
          <i
            v-if="vote.initialValue === 'coffee'"
            :class="['fas','fa-mug-hot']"
          />
          {{ vote.initialValue }}
        </button>
        <button class="result">
          <i
            v-if="vote.currentValue === 'coffee'"
            :class="['fas','fa-mug-hot']"
          />
		  <span v-html="show( vote )"></span>
          <div
            v-if="getGroupedVoteNames(vote).length > 0"
            class="vote-names"
          >
            {{ getGroupedVoteNames(vote).join(', ') }}
          </div>
        </button>
      </span>
    </p>
    <div class="reveal-votes">
      <button
        :disabled="allVoted || nobodyVoted || ! myVote"
        @click="toggleRevealVotes()"
      >
        <i :class="['fas',revealVotesButtonIconClass]" /> {{ revealVotesButtonText }}
      </button>
    </div>
  </span>
</template>
<script>
import { mapState } from "vuex";
export default {
	name: "Results",
	computed: {
		...mapState( [ "members", "votes", "voteCount", "votesRevealed", "activePoker", "myVote", "groupedVoterNames" ] ),
		allVoted() {
			return this.members.voters.length && this.voteCount === this.members.voters.length;
		},
		nobodyVoted() {
			return this.voteCount === 0;
		},
		revealVotesButtonText() {
			return this.votesRevealed ? "Hide votes" : "Reveal votes";
		},
		revealVotesButtonIconClass() {
			return this.votesRevealed ? "fa-eye-slash" : "fa-eye";
		}
	},
	methods: {
		show( vote ) {
			switch( vote.currentValue ) {
				case '#':
					return '<i class="fas fa-hat-wizard"></i>';
				case '!':
					return '<i class="fas fa-clipboard-check"></i>';
				default:
					return vote.currentValue;
			}
		},
		getGroupedVoteNames( vote ) {
			if ( ! this.groupedVoterNames ) {
				return [];
			}

			const voteGroupKey = vote.initialValue + "/" + vote.currentValue;
			return this.groupedVoterNames[ voteGroupKey ] || [];
		},
		toggleRevealVotes() {
			if ( ! this.votesRevealed ) {
				if ( ! window.confirm( "Are you sure you want to reveal all votes before everybody has voted? Everybody can see the results." ) ) {
					return;
				}
			}
			this.$socket.client.emit( "toggleRevealVotes", { poker: this.activePoker } );
		},
	},
};
</script>
