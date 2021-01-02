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
          {{ vote.currentValue }}
          <div
            v-if="getGroupedVoteNames(vote).length > 0"
            class="vote-names"
          >
            {{ getGroupedVoteNames(vote).join(', ') }}
          </div>
        </button>
      </span>
    </p><div class="reveal-votes">
      <button
        :disabled="allVoted || nobodyVoted || ! myVote"
        @click="toggleRevealVotes()"
      >
        <i :class="['fas',revealVotesButtonIconClass]" /> {{ revealVotesButtonText }}
      </button>
    </div>
    </p>
  </span>
</template>
<script>
import { mapState } from "vuex";
export default {
	name: "Results",
	computed: {
		...mapState( [ "members", "votes", "voteCount", "currentStory", "activePoker", "myVote" ] ),
		allVoted() {
			return this.members.voters.length && this.voteCount === this.members.voters.length;
		},
		nobodyVoted() {
			return this.voteCount === 0;
		},
		revealVotesButtonText() {
			return this.currentStory.votesRevealed ? "Hide votes" : "Reveal votes";
		},
		revealVotesButtonIconClass() {
			return this.currentStory.votesRevealed ? "fa-eye-slash" : "fa-eye";
		},
	},
	methods: {
		getGroupedVoteNames( vote ) {
			if ( ! this.groupedVoterNames ) {
				return [];
			}

			const voteGroupKey = vote.initialValue + "/" + vote.currentValue;
			return this.groupedVoterNames[ voteGroupKey ];
		},
		toggleRevealVotes() {
			if ( ! this.currentStory.votesRevealed ) {
				if ( ! window.confirm( "Are you sure you want to reveal all votes before everybody has voted? Everybody can see the results." ) ) {
					return;
				}
			}
			this.$socket.emit( "toggleRevealVotes", { poker: this.activePoker } );
		},
	},
};
</script>
