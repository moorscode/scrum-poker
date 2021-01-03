<template>
  <form class="storyName">
    <label>Story name:
      <input
        v-model="storyName"
        type="text"
        :class="storyNameUpdated ? 'changed' : ''"
        @keydown="storyNameUpdated = false"
        @change="storyNameUpdated = false"
      ></label>
    <input
      type="submit"
      value="Update"
      @click.prevent="setStoryName()"
    >
    <i
      v-if="storyNameUpdated"
      class="fas fa-check-circle story-updated"
    />
  </form>
</template>

<script>
import { mapState } from "vuex";
export default {
	name: "StoryName",
	data() {
		return {
			storyName: "",
			storyNameUpdated: false,
		};
	},
	computed: {
		...mapState( [ "activePoker", "currentStory" ] ),
	},
	methods: {
		setStoryName() {
			this.$socket.emit( "changeStoryName", { poker: this.activePoker, name: this.storyName } );
		},
	},
	sockets: {
		storyUpdated( msg ) {
			const nameChanged = ( this.currentStory.name !== msg.currentStory.name );

			this.storyName = msg.currentStory.name;
			this.$store.commit( "currentStory", msg.currentStory );

			if ( nameChanged ) {
				this.storyNameUpdated = true;
				setTimeout( () => {
					this.storyNameUpdated = false;
				}, 1400 );
			}
		},
	},
};
</script>
