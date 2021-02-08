<template>
  <div class="members-list-container">
    <button
      :class="showMemberList ? 'pressed' : ''"
      @click="showMemberList = ! showMemberList"
    >
      <i
        class="fas fa-clipboard-list"
      /> Users ({{ members.voters.length }}/{{ members.observers.length }}/{{ members.disconnected.length }})
    </button>
    <div :class="['members-list', showMemberList ? '' : 'hidden']">
      <strong>Voters</strong>
      <ul>
        <li v-for="voter in members.voters" v-bind:key=voter>
          {{ voter }} <i class="fas fa-person-booth" />
        </li>
        <li v-if="!members.voters.length">
          None
        </li>
      </ul>
      <strong>Observers</strong>
      <ul>
        <li v-for="observer in members.observers" v-bind:key=observer>
          {{ observer }} <i class="fas fa-user-secret" />
        </li>
        <li v-if="!members.observers.length">
          None
        </li>
      </ul>
      <strong>Disconnected</strong>
      <ul>
        <li v-for="disconnected in members.disconnected" v-bind:key=disconnected>
          {{ disconnected }} <i class="fas fa-plug disconnected" />
        </li>
        <li v-if="!members.disconnected.length">
          None
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
	name: "MemberList",
	data() {
		return {
			showMemberList: false,
		};
	},
	computed: {
		...mapState( [ "members" ] ),
	},
};
</script>
