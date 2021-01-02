<template>
    <section v-if="average !== ''">
        <p>
            Average: {{ average }}<br/>
            Standard deviation: {{ standardDeviation }}<br/>
            <strong>Average story point: {{ averagePoint }}</strong>
        </p>
        <p v-if="averageContext">
            <strong>{{ averageContext }}</strong>
        </p>
    </section>
</template>

<script>
import { mapState } from 'vuex';
export default {
    name: "result-statistics",
    computed: {
        ...mapState( [ 'voteCount', 'members', 'currentStory', 'points', 'votes' ] ),
        average() {
            if ( this.voteCount === 0 || this.voteCount < this.members.voters.length ) {
                return ''
            }

            if ( this.currentStory.voteAverage === 'coffee' ) {
                return 'Coffee break'
            }

            return Math.round( this.currentStory.voteAverage * 100 ) / 100;
        },
        averageContext() {
            if ( this.average === '' ) {
                return ''
            }

            // Find the difference between the lowest and the highest votes.
            const lowestIndex = this.points.indexOf( this.votes[ 0 ].currentValue );
            const highestIndex = this.points.indexOf( this.votes[ this.votes.length - 1 ].currentValue );

            if ( highestIndex - lowestIndex > 2 ) {
                return `Large gap between lowest and highest vote: ${ highestIndex - lowestIndex } cards!`
            }
        },
        standardDeviation() {
            if ( this.average === '' ) {
                return ''
            }

            if ( this.votes.length <= 1 || this.votes.map( vote => vote.currentValue ).indexOf( 'coffee' ) !== - 1 ) {
                return 'n/a'
            }

            let powers = 0
            for ( let i = 0; i < this.votes.length; i ++ ) {
                powers += Math.pow( parseFloat( this.votes.map( vote => vote.currentValue )[ i ] ) - this.average, 2 )
            }

            return Math.round( Math.sqrt( powers / this.votes.length ) * 100 ) / 100
        },
        averagePoint() {
            if ( this.average === '' ) {
                return ''
            }

            return this.currentStory.nearestPointAverage;
        },
    }
}
</script>