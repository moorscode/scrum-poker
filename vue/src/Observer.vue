<template>
  <div class="observe">
    <label>
      <input
        v-model="observer"
        type="checkbox"
      >
      {{ observing }}
    </label>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
	name: "Observer",
	data() {
		return {
		};
	},
	created() {
		this.$store.commit( "observe", window.localStorage.getItem( this.activePoker + "-observer" ) === "true" );
	},
	computed: {
		...mapState( [ "activePoker", "joinPoker", "nickname" ] ),
		activePoker() {
			return this.$store.state.activePoker;
		},
		observer: {
			get() {
				return this.$store.state.observer;
			},
			set( observing ) {
				window.localStorage.setItem( this.activePoker + "-observer", observing );
				this.$store.commit( "observe", observing );

				if ( observing ) {
					this.$socket.emit( "observe", { poker: this.activePoker } );
				} else {
					this.$socket.emit( "join", { poker: this.activePoker, name: this.nickname } );
				}
			},
		},
		observing() {
			return this.observer ? "Observing…" : "Observe";
		},
	},
	sockets: {
		joined() {
			if ( this.observer ) {
				this.$socket.emit( "observe", { poker: this.activePoker } );
			}
		},
	},
};
</script>
