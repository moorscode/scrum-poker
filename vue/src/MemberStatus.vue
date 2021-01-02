<template>
    <div class="voting" v-if="unvotedNames.length > 0">
        <div class="voted">
            <strong><i class="far fa-check-circle"></i> Voted:</strong>
            <ul>
                <li v-for="name of votedNames">{{ name }}</li>
            </ul>
            <p v-if="votedNames.length === 0">Nobody voted yet.</p>
        </div>
        <div class="unvoted">
            <strong><i class="far fa-times-circle"></i> Not voted yet:</strong>
            <ul>
                <li v-for="name of unvotedNames">{{ name }}</li>
            </ul>
            <p v-if="unvotedNames.length === 0">Everybody voted!</p>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: "member-status",
    computed: {
        ...mapState( [ 'votedNames', 'members' ] ),
        unvotedNames() {
            const result = this.members.voters.map( member => member.name )
            for ( const name of this.votedNames ) {
                const index = result.indexOf( name )
                if ( index !== - 1 ) {
                    result.splice( index, 1 )
                }
            }
            return result
        },
    }
}
</script>