<template>
    <span>
        <button @click="newStory()" class="newStory" :disabled="voteCount === 0 || observer"><i class="fas fa-plus-square"></i>
            New story
        </button>
        <span class="allVoted" v-if="allVoted">All votes are in!</span>
    </span>
</template>

<script>
import { mapState } from 'vuex'
export default {
    computed: {
        ...mapState( [ 'voteCount', 'observer', 'members', 'activePoker' ] ),
        allVoted() {
            return this.members.voters.length && this.voteCount === this.members.voters.length;
        }
    },
    methods: {
        newStory() {
            if ( this.voteCount === 0 || this.observer ) {
                return
            }

            // Confirm when not everybody has voted.
            if ( this.voteCount !== this.members.voters.length ) {
                if ( ! window.confirm( 'Are you sure you want to start a new story, not all votes are in yet.' ) ) {
                    return
                }
            }

            this.$socket.emit( 'newStory', { poker: this.activePoker } )
            this.$store.commit( 'refinementFinished', false );
        },
    }
}
</script>