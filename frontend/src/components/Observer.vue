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
	name: "observer",
	created() {
		const observing = window.localStorage.getItem( this.activePoker + "-observer" ) === "true";
		this.$store.commit( "observe", observing );
		if ( observing ) {
			this.$socket.client.emit( "observe", { poker: this.activePoker } );
		}
	},
	computed: {
		...mapState( [ "activePoker", "joinPoker", "nickname" ] ),
		observer: {
			get() {
				return this.$store.state.observer;
			},
			set( observing ) {
				window.localStorage.setItem( this.activePoker + "-observer", observing );
				this.$store.commit( "observe", observing );

				if ( observing ) {
					this.$socket.client.emit( "observe", { poker: this.activePoker } );
				} else {
					this.$socket.client.emit( "join", { poker: this.activePoker, name: this.nickname } );
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
				this.$socket.client.emit( "observe", { poker: this.activePoker } );
			}
		},
	},
};
</script>
