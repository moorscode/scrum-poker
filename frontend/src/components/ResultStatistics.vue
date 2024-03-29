<template>
	<section v-if="average !== ''">
		<p>
			Average: {{ average }}<br>
			Standard deviation: {{ standardDeviation }}<br>
			<strong>Average story point: {{ averagePoint }}</strong>
		</p>
		<p v-if="averageContext">
			<strong>{{ averageContext }}</strong>
		</p>
	</section>
</template>

<script>
import { mapState } from "vuex";

export default {
	name: "ResultStatistics",
	computed: {
		...mapState( [ "voteCount", "members", "voteAverage", "nearestPointAverage", "points", "votes", "votesRevealed" ] ),
		average() {
			if ( ! this.votesRevealed && ( this.voteCount === 0 || this.voteCount < this.members.voters.length ) ) {
				return "";
			}

			if ( this.voteAverage === "coffee" ) {
				return "Coffee break";
			}

			if ( this.voteAverage === "?" ) {
				return "Not enough clarity, please go further in depth.";
			}

			if ( this.votes.every( ( vote ) => isNaN( vote ) ) ) {
				return "";
			}

			return Math.round( this.voteAverage * 100 ) / 100;
		},
		averageContext() {
			if ( this.average === "" ) {
				return "";
			}

			// Find the difference between the lowest and the highest votes.
			const lowestIndex  = this.points.indexOf( this.votes[ 0 ].currentValue );
			const highestIndex = this.points.indexOf( this.votes[ this.votes.length - 1 ].currentValue );

			const highestNumericPoint = this.points.filter( ( point ) => typeof point === "number" ).length;
			if ( highestIndex >= highestNumericPoint ) {
				return "";
			}

			if ( highestIndex - lowestIndex > 2 ) {
				return `Large gap between lowest and highest vote: ${ highestIndex - lowestIndex } cards!`;
			}
		},
		standardDeviation() {
			if ( this.average === "" ) {
				return "";
			}

			if ( this.votes.length <= 1 ) {
				return "n/a";
			}

			const flattenedVotes = this.votes.map( vote => vote.currentValue );

			if ( flattenedVotes.indexOf( "coffee" ) !== -1 ) {
				return "n/a";
			}

			if ( flattenedVotes.indexOf( "?" ) !== -1 ) {
				return "n/a";
			}

			const numberVotes = flattenedVotes
				.map( ( vote ) => typeof vote === "number" ? parseFloat( "" + vote ) : null )
				.filter( ( vote ) => vote !== null );

			let powers = 0;
			for ( let i = 0; i < numberVotes.length; i++ ) {
				powers += Math.pow( numberVotes[ i ] - this.average, 2 );
			}

			return Math.round( Math.sqrt( powers / numberVotes.length ) * 100 ) / 100;
		},
		averagePoint() {
			if ( this.average === "" ) {
				return "";
			}

			return this.nearestPointAverage;
		},
	},
};
</script>
