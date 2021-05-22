<template>
  <div
    v-if="unvotedNames.length > 0"
    class="voting"
  >
    <div class="voted">
      <strong><i class="far fa-check-circle" /> Voted:</strong>
      <ul>
        <li v-for="name of votedNames" v-bind:key=name>
          {{ name }}
        </li>
      </ul>
      <p v-if="votedNames.length === 0">
        Nobody voted yet.
      </p>
    </div>
    <div class="unvoted">
      <strong><i class="far fa-times-circle" /> Not voted yet:</strong>
      <ul>
        <li v-for="name of unvotedNames" v-bind:key=name>
          {{ name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
	name: "MemberStatus",
	computed: {
		...mapState( [ "votedNames", "members" ] ),
		unvotedNames() {
			const result = Object.values( this.members.voters );
			for ( const name of this.votedNames ) {
				const index = result.indexOf( name );
				if ( index !== -1 ) {
					result.splice( index, 1 );
				}
			}
			return result;
		},
	},
};
</script>
