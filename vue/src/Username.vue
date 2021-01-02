<template>
    <section v-if=activePoker>
        <form class="username" :class="[!nickname ? 'hover' : '']">
            <span><i class="fas fa-signature"></i> Nickname:</span>
            <input type="text" v-model="nickname"/>
            <input type="submit" @click.prevent="updateNickname" value="Update"/>
        </form>
    </section>
</template>

<script>
import { mapState } from 'vuex'

export default {
    name: "username",
    data() {
        return {
            nickname: window.localStorage.getItem( 'nickname' ),
        }
    },
    created() {
        this.updateNickname();
    },
    computed: {
        ...mapState( [ 'activePoker' ] ),
    },
    methods: {
        updateNickname() {
            if ( ! this.nickname ) {
                return
            }

            window.localStorage.setItem( 'nickname', this.nickname )
            this.$socket.emit( 'nickname', { name: this.nickname, poker: this.activePoker } )
        },
    },
}
</script>