<template>
  <main :class="[ { observing: observer }, backgroundColor ]">
	<theme-picker />
	<server-connection />

	<section v-if="loading === false" class="poker container">
	<h1>{{ title }}</h1>

	<section v-if="connected === false">
		<connecting />
	</section>

	<section v-if="connected === true">
		<room />

		<div v-cloak v-if="room" class="pokerMain">
			<refinement-finished v-if="refinementFinished" />

			<section v-if="!refinementFinished">
				<member-list />
				<nickname />
				<observer />
				<story /> <refinement />

				<section class="storyControls">
					<div class="flex">
						<story-name />
						<voting-system />
					</div>
					<poker-choices />
				</section>

				<results />
				<result-statistics />

				<member-status />

				<story-history />
			</section>
		</div>
		</section>
	</section>

	<feature-list v-if="this.room === false && this.loading === false" />

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
import ServerConnection from "./components/ServerConnection.vue";
import Connecting from "./components/Connecting.vue";
import ThemePicker from "./components/ThemePicker.vue";
import VotingSystem from "./components/VotingSystem.vue";

export default Vue.extend( {
	components: {
		VotingSystem,
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
		ServerConnection,
		Connecting,
		ThemePicker,
	},
	created() {
		this.$socket.client.open();
	},
	computed: {
		...mapState(
			[
				"loading",
				"room",
				"refinementFinished",
				"voteCount",
				"members",
				"voteAverage",
				"points",
				"votes",
				"connected",
				"observer",
			],
		),
		backgroundColor() {
			switch ( true ) {
				case this.refinementFinished:
					return "finished";
				case this.pointSpread === "":
					return "";
				case this.pointSpread === 0:
					return "no-spread";
				case this.pointSpread >= 2:
					return "high-spread";
				default:
					return "normal-spread";
			}
		},
		title() {
			return this.observer ? "Observer mode" : "Pum Scroker";
		},
		pointSpread() {
			if ( this.voteCount === 0 || this.voteCount < this.members.voters.length || typeof this.voteAverage === "string" ) {
				return null;
			}

			// Find the difference between the lowest and the highest votes.
			const lowestIndex = this.points.indexOf( this.votes[ 0 ].currentValue );
			const highestIndex = this.points.indexOf( this.votes[ this.votes.length - 1 ].currentValue );

			return highestIndex - lowestIndex;
		},
	},
} );
</script>
