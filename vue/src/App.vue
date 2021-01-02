<template>
  <main :class="backgroundColor">
    <section
      v-if="loading === false"
      class="poker"
    >
      <h1>Pum Scroker</h1>

      <room v-if="!activePoker" />

      <div
        v-cloak
        v-if="activePoker"
        class="pokerMain"
      >
        <refinement-finished v-if="refinementFinished" />

        <section v-if="!refinementFinished">
          <member-list />
          <username />
          <observer />
          <new-story /> <finish-refinement />

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

    <feature-list v-if="!this.activePoker && !this.loading" />

    <credits />
  </main>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState } from "vuex";
import FinishRefinement from "./FinishRefinement.vue";
import MemberList from "./MemberList.vue";
import MemberStatus from "./MemberStatus.vue";
import NewStory from "./NewStory.vue";
import Observer from "./Observer.vue";
import Room from "./Room.vue";
import PokerChoices from "./PokerChoices.vue";
import RefinementFinished from "./RefinementFinished.vue";
import Results from "./Results.vue";
import ResultStatistics from "./ResultStatistics.vue";
import StoryName from "./StoryName.vue";
import Username from "./Username.vue";
import StoryHistory from "./StoryHistory.vue";
import FeatureList from "./FeatureList.vue";
import Credits from "./Credits.vue";

export default Vue.extend( {
	components: {
		Observer,
		Room,
		Username,
		RefinementFinished,
		MemberList,
		NewStory,
		FinishRefinement,
		StoryName,
		PokerChoices,
		Results,
		ResultStatistics,
		MemberStatus,
		StoryHistory,
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
			this.$socket.emit( "exit" );
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
			this.$socket.emit( "identify", { id: this.$data.clientId } );
		},
		welcome() {
			this.$store.commit( "loadingFinished" );
		},
		reconnect() {
			this.$socket.emit( "identify", { id: this.$data.clientId } );
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
			this.$store.commit( "votedNames", msg.votedNames || [] );
			this.$store.commit( "groupedVoterNames", msg.groupedVoterNames || [] );
			this.$store.commit( "pointSpread", this.$data.pointSpread );

			document.title = this.$data.baseTitle + " " + this.$store.state.voteCount + "/" + this.$store.state.members.voters.length;
		},
	},
} );
</script>
