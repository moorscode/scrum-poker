<template>
    <section>
        <p>Welcome to Pum Scroker!</p>

        <p>This tool was created for scrum-teams to have a digital place where they can do their refinement.
            As many teams are working remotely due to the global COVID-19 situation.
        </p>
        <p>Join a room to start refining.</p>

        <form class="rooms">
            Room: <input type="text" v-model="joinPoker"/>
            <input type="submit" @click.prevent="joinRoom" value="Join room!">
        </form>

        <p>
            <em>Suggestion: Prefix the room with your company name to ensure you are not
                competing for a room.</em>
        </p>
    </section>
</template>

<script>
import { mapState } from 'vuex'

export default {
    name: 'pick-room',
    data() {
        return {
            joinPoker: this.getFromURL( 'room' ) || ''
        };
    },
    methods: {
        joinRoom() {
            this.joinPoker = this.joinPoker.toLowerCase()

            if ( this.joinPoker === '' ) {
                this.$store.commit( 'activePoker', '' );
                return
            }

            this.$socket.emit( 'join', { poker: this.joinPoker, name: this.$store.state.nickname } )
        },
        getFromURL( key ) {
			return new URLSearchParams( window.location.search.substring( 1 ) ).get( key )
		},
    },
    computed: {
        ...mapState( [ 'activePoker' ] ),
    },
    created() {
        this.joinRoom();

		window.onpopstate = ( event ) => {
            this.joinPoker = ( event.state && event.state.room ) || ''
            if ( this.joinPoker !== this.activePoker ) {
                this.$socket.emit( 'leave', { poker: this.activePoker } )
            }
            this.joinRoom()
        };
    },
    sockets: {
        joined( msg ) {
            const currentPoker = this.activePoker;
            this.joinPoker = msg.poker
            this.$store.commit( 'activePoker', msg.poker );

            if ( currentPoker !== false && currentPoker !== msg.poker ) {
                const url = new URL( window.location )
                url.searchParams.set( 'room', msg.poker )
                window.history.pushState( { room: msg.poker }, '', url )
            }
        }
    }
};
</script>