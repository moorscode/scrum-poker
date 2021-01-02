<template>
    <span>
    <p :class="[ 'results', members.length === voteCount ? 'final' : '' ]">
        <span class="resultContainer" v-for="vote of votes">
            <button class="result initialVote" v-if="vote.initialValue !== vote.currentValue">
                <i :class="['fas','fa-mug-hot']" v-if="vote.initialValue === 'coffee'"></i>
                {{ vote.initialValue }}
            </button>
            <button class="result">
                <i :class="['fas','fa-mug-hot']" v-if="vote.currentValue === 'coffee'"></i>
                {{ vote.currentValue }}
                <div class="vote-names" v-if="getGroupedVoteNames(vote).length > 0">
                    {{ getGroupedVoteNames(vote).join(', ') }}
                </div>
            </button>
        </span>
        <div class="reveal-votes">
            <button @click="toggleRevealVotes()" :disabled="allVoted || nobodyVoted || ! myVote">
                <i :class="['fas',revealVotesButtonIconClass]"></i> {{revealVotesButtonText}}
            </button>
        </div>
    </p>
    </span>
</template>
<script>
import { mapState } from 'vuex'
export default {
    name: 'results',
    computed: {
        ...mapState( [ 'members', 'votes', 'voteCount', 'currentStory', 'activePoker', 'myVote' ] ),
        allVoted() {
            return this.members.voters.length && this.voteCount === this.members.voters.length;
        },
        nobodyVoted() {
            return this.voteCount === 0;
        },
        revealVotesButtonText() {
            return this.currentStory.votesRevealed ? 'Hide votes' :'Reveal votes';
        },
        revealVotesButtonIconClass() {
            return this.currentStory.votesRevealed ? 'fa-eye-slash' :'fa-eye';
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
            this.$socket.emit( 'toggleRevealVotes', { poker: this.activePoker } )
        },
    }
}
</script>