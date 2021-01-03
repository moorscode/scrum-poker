<template>
  <main :class="backgroundColor">
    <section v-if="loading === false" class="poker">
      <h1>Pum Scroker</h1>

      <room v-if="!activePoker" />

      <div v-cloak v-if="activePoker" class="pokerMain">
        <refinement-finished v-if="refinementFinished" />

        <section v-if="!refinementFinished">
          <member-list />
          <nickname />
          <observer />
          <story /> <refinement />

          <hr>

          <story-name />
          <poker-choices />

          <hr>

          <results />
          <result-statistics />

          <member-status />

          <story-history />
        </section>
      </div>
    </section>

    <feature-list v-if="this.activePoker === '' && this.loading === false" />

    <credits />
  </main>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState } from "vuex";

import Refinement from "./components/Refinement.vue";
import MemberList from "./components/MemberList.vue";
import MemberStatus from "./components/MemberStatus.vue";
import Story from "./components/Story.vue";
import Observer from "./components/Observer.vue";
import Room from "./components/Room.vue";
import PokerChoices from "./components/PokerChoices.vue";
import RefinementFinished from "./components/RefinementFinished.vue";
import Results from "./components/Results.vue";
import ResultStatistics from "./components/ResultStatistics.vue";
import StoryName from "./components/StoryName.vue";
import Nickname from "./components/Nickname.vue";
import StoryHistory from "./components/StoryHistory.vue";
import FeatureList from "./components/FeatureList.vue";
import Credits from "./components/Credits.vue";

export default Vue.extend( {
	components: {
		Room,
		Nickname,
		Observer,
		MemberList,
		MemberStatus,
		Refinement,
		RefinementFinished,
		Story,
		StoryName,
		StoryHistory,
		PokerChoices,
		Results,
		ResultStatistics,
		FeatureList,
		Credits,
	},
	data() {
		return {
			clientId: window.localStorage.getItem( "clientId" ) || false,
			baseTitle: document.title,
		};
	},
	created() {
		window.onbeforeunload = () => {
			this.$socket.client.emit( "exit" );
		};
	},
	computed: {
		...mapState( [ "loading", "activePoker", "refinementFinished", "pointSpread", "voteCount", "members", "currentStory", "points", "votes" ] ),
		backgroundColor() {
			switch ( true ) {
				case this.refinementFinished:
					return "finished";
				case this.pointSpread === "":
					return "";
				case this.pointSpread === 0:
					return "no-spread";
				case this.pointSpread > 2:
					return "high-spread";
				default:
					return "normal-spread";
			}
		},
		average() {
			if ( this.voteCount === 0 || this.voteCount < this.members.voters.length ) {
				return "";
			}

			if ( this.currentStory.voteAverage === "coffee" ) {
				return "Coffee break";
			}

			return Math.round( this.currentStory.voteAverage * 100 ) / 100;
		},
		pointSpread() {
			if ( this.average === "" ) {
				return null;
			}

			// Find the difference between the lowest and the highest votes.
			const lowestIndex = this.points.indexOf( this.votes[ 0 ].currentValue );
			const highestIndex = this.points.indexOf( this.votes[ this.votes.length - 1 ].currentValue );

			return highestIndex - lowestIndex;
		},
	},
	sockets: {
		userId( clientId ) {
			if ( ! this.$data.clientId ) {
				this.$data.clientId = clientId;
				window.localStorage.setItem( "clientId", this.$data.clientId );
			}
			this.$socket.client.emit( "identify", { id: this.$data.clientId } );
		},
		welcome() {
			this.$store.commit( "loadingFinished" );
		},
		reconnect() {
			this.$socket.client.emit( "identify", { id: this.$data.clientId } );
		},
		"member-list"( msg ) {
			this.$store.commit( "members", msg );
		},
		points( msg ) {
			this.$store.commit( "points", msg.points );
		},
		votes( msg ) {
			const votes = msg.votes.sort( ( a, b ) => a.currentValue - b.currentValue ) || [];

			this.$store.commit( "votes", votes );
			this.$store.commit( "voteCount", msg.voteCount );
			this.$store.commit( "votedNames", msg.votedNames );
			this.$store.commit( "groupedVoterNames", msg.groupedVoterNames );
			this.$store.commit( "pointSpread", this.$data.pointSpread );

			document.title = this.$data.baseTitle + " " + this.$store.state.voteCount + "/" + this.$store.state.members.voters.length;
		},
	},
} );
</script>
