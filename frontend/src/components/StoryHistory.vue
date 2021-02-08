<template>
  <div :class="['storyHistory', showHistory !== false ? '':'hidden']">
    <h3 @click="toggleHistory()">
      Story history
    </h3>
    <section class="story">
      <button
        v-if="!observer"
        :disabled="storyHistory.length === 0"
        @click="resetHistory()"
      >
        <i class="fas fa-eraser" />
        Reset history
      </button>
      <button
        v-if="!observer"
        :disabled="storyHistory.length === 0"
        @click="popHistory()"
      >
        <i
          class="fas fa-backspace"
        />
        Delete last result
      </button>
      <section v-for="story of storyHistory" v-bind:key=story>
        <strong>Story {{ story.name || 'result' }}: {{ story.nearestPointAverage }}</strong>
		<br>
        Votes:
        <ul>
          <li v-for="vote of story.votes" v-bind:key=vote>
            {{ vote.voterName }}:
            <span
              v-if="vote.initialValue !== vote.currentValue"
              class="initialVote"
            >{{ vote.initialValue }}</span>
            <i
              v-if="vote.initialValue !== vote.currentValue"
              :class="['fas','fa-arrow-right']"
            />
            {{ vote.currentValue }}
          </li>
        </ul>
      </section>
    </section>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
	name: "StoryHistory",
	data() {
		return {
			showHistory: window.localStorage.getItem( "showHistory" ) !== "false",
			storyHistory: [],
		};
	},
	computed: {
		...mapState( [ "observer", "activePoker" ] ),
	},
	methods: {
		toggleHistory() {
			this.showHistory = ! this.showHistory;
			window.localStorage.setItem( "showHistory", this.showHistory );
		},
		resetHistory() {
			if ( ! window.confirm(
				"Are you sure you want to clear the history?\n\n" +
				"This clears the history for all members in this room." )
			) {
				return;
			}
			this.$socket.client.emit( "resetHistory", { poker: this.activePoker } );
		},
		popHistory() {
			if ( ! window.confirm(
				"Are you sure you want to remove the last history item?\n\n" +
				"This removes the item for all members in this room." )
			) {
				return;
			}
			this.$socket.client.emit( "popHistory", { poker: this.activePoker } );
		},
	},
	sockets: {
		history( msg ) {
			this.storyHistory = ( msg.stories || [] ).reverse();
		},
	},
};
</script>
