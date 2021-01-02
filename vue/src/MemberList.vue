<template>
    <div class="members-list-container">
        <button @click="showMemberList = !showMemberList" :class="showMemberList ? 'pressed' : ''"><i
                class="fas fa-clipboard-list"></i> Users ({{ members.voters.length }}/{{ members.observers.length }}/{{ members.disconnected.length }})
        </button>
        <div :class="['members-list', showMemberList ? '' : 'hidden']">
            <strong>Voters</strong>
            <ul>
                <li v-for="voter in members.voters">{{ voter.name }} <i class="fas fa-person-booth"></i></li>
                <li v-if="!members.voters.length">None</li>
            </ul>
            <strong>Observers</strong>
            <ul>
                <li v-for="observer in members.observers">{{ observer.name }} <i class="fas fa-user-secret"></i></li>
                <li v-if="!members.observers.length">None</li>
            </ul>
            <strong>Disconnected</strong>
            <ul>
                <li v-for="disconnected in members.disconnected">{{ disconnected.name }} <i class="fas fa-plug disconnected"></i></li>
                <li v-if="!members.disconnected.length">None</li>
            </ul>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
    name: "member-list",
    data() {
        return {
            showMemberList: false,
        }
    },
    computed: {
        ...mapState( ['members'] ),
    }
}
</script>