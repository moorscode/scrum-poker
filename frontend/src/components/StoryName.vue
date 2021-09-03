<template>
  <form class="storyName">
    <label>Story name:
      <input
        v-model="editStoryName"
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
			editStoryName: "",
			storyNameUpdated: false,
		};
	},
	computed: {
		...mapState( [ "room", "storyName" ] ),
	},
	methods: {
		setStoryName() {
			this.$socket.client.emit( "changeStoryName", { poker: this.room, name: this.editStoryName } );
		},
	},
	sockets: {
		story( { name } ) {
			const nameChanged = ( this.storyName !== name );

			this.editStoryName = name;

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
