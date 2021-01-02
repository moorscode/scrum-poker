<template>
    <div :class="['storyHistory', showHistory ? '':'hidden']">
        <h3 @click="toggleHistory()">Story history</h3>
        <section class="story">
            <button @click="resetHistory()" v-if="!observer" :disabled="storyHistory.length === 0"><i
                    class="fas fa-eraser"></i>
                Reset history
            </button>
            <button @click="popHistory()" v-if="!observer" :disabled="storyHistory.length === 0"><i
                    class="fas fa-backspace"></i>
                Delete last result
            </button>
            <section v-for="story of storyHistory">
                <strong>Story {{ story.name || 'result' }}: {{ story.nearestPointAverage }}</strong><br/>
                Votes:
                <ul>
                    <li v-for="vote of story.votes">
                        {{ vote.voterName }}:
                        <span class="initialVote" v-if="vote.initialValue !== vote.currentValue">{{ vote.initialValue }}</span>
                        <i v-if="vote.initialValue !== vote.currentValue"
                            :class="['fas','fa-arrow-right']"></i>
                        {{ vote.currentValue }}
                    </li>
                </ul>
            </section>
        </section>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: "story-history",
    data() {
        return {
            showHistory: window.localStorage.getItem( 'showHistory' ),
            storyHistory: [],
        }
    },
    computed: {
        ...mapState( [ 'observer', 'activePoker' ] ),
    },
    methods: {
        toggleHistory() {
            this.showHistory = !this.showHistory
            window.localStorage.setItem( 'showHistory', this.showHistory )
        },
        resetHistory() {
            if ( ! window.confirm( 'Are you sure you want to clear the history?\n\nThis clears the history for all members in this room.' ) ) {
                return
            }
            this.$socket.emit( 'resetHistory', { poker: this.activePoker } )
        },
        popHistory() {
            if ( ! window.confirm( 'Are you sure you want to remove the last history item?\n\nThis removes the item for all members in this room.' ) ) {
                return
            }
            this.$socket.emit( 'popHistory', { poker: this.activePoker } )
        },
    },
    sockets: {
        history(msg) {
			this.storyHistory = ( msg.stories || [] ).reverse()
        }
    }
}
</script>