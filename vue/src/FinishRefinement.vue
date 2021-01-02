<template>
    <button @click="done()" class="refinement-done"><i class="fas fa-clipboard-check"></i> Finish refinement</button>
</template>

<script>
import { mapState } from 'vuex';
export default {
    name: "finish-refinement",
    computed: {
        ...mapState( [ 'activePoker' ] )
    },
    methods: {
        done() {
            this.$socket.emit( 'finish', { poker: this.activePoker } )
        },
    },
    sockets: {
        finished() {
            this.$store.commit( 'refinementFinished', true );
        }
    }
}
</script>